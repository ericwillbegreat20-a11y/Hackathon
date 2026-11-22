/* Local face presence detection for MISSPAY. No identity matching or recording. */
(function (root) {
  'use strict';

  const zh = () => !!root.__campusLang;
  const L = (en, cn) => zh() ? cn : en;

  function cameraError(error) {
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError')
      return L('Camera permission was denied. Allow camera access in your browser and retry.','摄像头权限已被拒绝。请在浏览器中允许访问摄像头后重试。');
    if (error?.name === 'NotFoundError') return L('No camera was found. Connect a camera and retry.','未找到摄像头。请连接摄像头后重试。');
    if (error?.name === 'NotReadableError') return L('The camera is busy. Close other camera apps and retry.','摄像头正被占用。请关闭其他摄像头应用后重试。');
    return L('The camera could not start. Check your browser permissions and retry.','摄像头无法启动。请检查浏览器权限后重试。');
  }

  function create({ video, onStatus, onDetected }) {
    let stream = null, canvas = null, context = null, classify = null;
    let frameTimer = null, limitTimer = null, generation = 0, active = false, matches = 0;
    const report = (state, message) => onStatus?.({ state, message });
    const stopTracks = media => media?.getTracks().forEach(track => track.stop());

    function stop() {
      generation++;
      active = false;
      matches = 0;
      root.clearTimeout(frameTimer);
      root.clearTimeout(limitTimer);
      frameTimer = limitTimer = null;
      stopTracks(stream);
      stream = null;
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      if (canvas) { canvas.width = 0; canvas.height = 0; }
      canvas = context = null;
    }

    function fail(message) {
      stop();
      report('error', message);
    }

    function detect(token) {
      if (!active || token !== generation) return;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        frameTimer = root.setTimeout(() => detect(token), 150);
        return;
      }
      let rgba = null, gray = null, found = false;
      try {
        const width = 320, height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        rgba = context.getImageData(0, 0, width, height).data;
        gray = new Uint8Array(width * height);
        for (let pixel = 0; pixel < gray.length; pixel++) {
          const offset = pixel * 4;
          gray[pixel] = (2 * rgba[offset] + 7 * rgba[offset + 1] + rgba[offset + 2]) / 10;
        }
        // Only this frame is processed. No detection memory or face features are retained.
        const detections = root.pico.run_cascade(
          { pixels: gray, nrows: height, ncols: width, ldim: width }, classify,
          { shiftfactor: 0.12, minsize: 48, maxsize: Math.min(width, height), scalefactor: 1.1 }
        );
        found = root.pico.cluster_detections(detections, 0.2).some(detection => detection[3] > 5);
      } catch {
        fail(L('Local face detection failed. Please retry with the camera facing you.','本地人脸检测失败。请正对摄像头后重试。'));
        return;
      } finally {
        // Clear the temporary pixel buffers immediately after each detection pass.
        rgba?.fill(0);
        gray?.fill(0);
        if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
      }
      matches = found ? matches + 1 : 0;
      if (matches >= 2) {
        stop();
        report('verified', L('Face detected. Camera closed.','已检测到人脸，摄像头已关闭。'));
        onDetected?.();
        return;
      }
      report('scanning', found ? L('Face found. Hold still for a moment…','已发现人脸，请保持不动…') : L('Look at the camera in good light. Searching for a face…','请在光线良好的地方正对摄像头。正在搜索人脸…'));
      frameTimer = root.setTimeout(() => detect(token), 250);
    }

    async function start() {
      if (active) return;
      stop();
      if (!root.isSecureContext || !root.navigator.mediaDevices?.getUserMedia) {
        report('error', L('Camera access needs a secure browser context. Use localhost or HTTPS, then retry.','摄像头访问需要安全的浏览器环境。请使用 localhost 或 HTTPS 后重试。'));
        return;
      }
      if (!root.pico || !root.MisspayFaceModel) {
        report('error', L('Local face detector files are missing. Keep all prototype files in the same folder.','本地人脸检测文件缺失。请将所有原型文件放在同一文件夹中。'));
        return;
      }
      try {
        if (!classify) {
          const model = Int8Array.from(root.atob(root.MisspayFaceModel), character => character.charCodeAt(0));
          try { classify = root.pico.unpack_cascade(model); } finally { model.fill(0); }
        }
      } catch {
        report('error', L('The local face detector could not load. Restore the prototype files and retry.','本地人脸检测器无法加载。请恢复原型文件后重试。'));
        return;
      }
      const token = generation;
      active = true;
      report('requesting', L('Allow camera access to begin. No audio is requested.','请允许访问摄像头以开始。不会请求音频。'));
      limitTimer = root.setTimeout(() => {
        if (active && token === generation) fail(L('Camera access took too long. Check permissions and retry.','摄像头访问耗时过长。请检查权限后重试。'));
      }, 20000);
      try {
        const media = await root.navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false
        });
        // A late permission grant after cancellation must not leave the camera running.
        if (!active || token !== generation) { stopTracks(media); return; }
        stream = media;
        stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
          if (active && token === generation) fail(L('The camera was disconnected. Reconnect it and retry.','摄像头已断开连接。请重新连接后重试。'));
        }, { once: true }));
        video.srcObject = media;
        video.muted = true;
        video.playsInline = true;
        await video.play();
        if (!active || token !== generation) return;
        root.clearTimeout(limitTimer);
        canvas = root.document.createElement('canvas');
        context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) { fail(L('This browser cannot process the camera preview. Try Chrome or Edge.','此浏览器无法处理摄像头预览。请使用 Chrome 或 Edge。')); return; }
        limitTimer = root.setTimeout(() => {
          if (active && token === generation) fail(L('No face detected within 30 seconds. Face the camera in good light and retry.','30 秒内未检测到人脸。请在光线良好的地方正对摄像头后重试。'));
        }, 30000);
        report('scanning', L('Camera is live. Looking for a face…','摄像头已开启。正在查找人脸…'));
        detect(token);
      } catch (error) {
        if (active && token === generation) fail(cameraError(error));
      }
    }

    function cancel() { stop(); report('stopped', L('Camera closed. You can restart verification.','摄像头已关闭。你可以重新启动验证。')); }
    const onPageHide = () => cancel();
    const onVisibility = () => { if (root.document.hidden && active) cancel(); };
    root.addEventListener('pagehide', onPageHide);
    root.document.addEventListener('visibilitychange', onVisibility);
    function destroy() {
      stop();
      classify = null;
      root.removeEventListener('pagehide', onPageHide);
      root.document.removeEventListener('visibilitychange', onVisibility);
    }
    return { start, cancel, destroy };
  }

  root.MisspayFaceCamera = { create };
})(window);
