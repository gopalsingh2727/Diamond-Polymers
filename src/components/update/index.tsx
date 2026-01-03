import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal/index';
import './update.css';

type VersionInfo = {
  version: string;
  newVersion: string;
  update: boolean;
  releaseNotes?: string;
};

type ErrorType = {
  message: string;
  [key: string]: any;
};

type DownloadProgress = {
  progress: number;
  downloaded: number;
  total: number;
};

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'downloaded' | 'installing';

const Update = () => {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ progress: 0, downloaded: 0, total: 0 });

  const checkUpdate = async () => {
    setStatus('checking');
    const result = await window.ipcRenderer.invoke('check-update');
    setStatus('idle');
    setModalOpen(true);

    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
      if (result?.version) {
        setVersionInfo({
          version: result.version,
          newVersion: result.version,
          update: false
        });
      }
    } else {
      setVersionInfo(result);
      setUpdateError(undefined);
      setUpdateAvailable(result.update);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, info: VersionInfo) => {
      setVersionInfo(info);
      setUpdateError(undefined);
      setUpdateAvailable(info.update);

      if (info.update) {
        setModalOpen(true);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, err: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(err);
      setStatus('idle');
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, progress: DownloadProgress) => {
      setDownloadProgress(progress);
    },
    []
  );

  const startDownload = async () => {
    try {
      setStatus('downloading');
      setDownloadProgress({ progress: 0, downloaded: 0, total: 0 });

      const result = await window.ipcRenderer.invoke('download-update');

      if (result.success) {
        setStatus('downloaded');
      } else {
        setUpdateError({ message: result.error || 'Download failed' });
        setStatus('idle');
      }
    } catch (err) {

      setUpdateError({ message: 'Download failed' });
      setStatus('idle');
    }
  };

  const installUpdate = async () => {
    try {
      setStatus('installing');
      const result = await window.ipcRenderer.invoke('install-update');

      if (!result.success) {
        setUpdateError({ message: result.error || 'Installation failed' });
        setStatus('downloaded');
      }
      // If successful, app will quit
    } catch (err) {

      setUpdateError({ message: 'Installation failed' });
      setStatus('downloaded');
    }
  };

  const openDownloadPage = async () => {
    try {
      await window.ipcRenderer.invoke('open-download-page');
    } catch (err) {

    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModalButtons = () => {
    if (status === 'downloading') {
      return {
        okText: 'Downloading...',
        cancelText: 'Cancel',
        onOk: () => {},
        onCancel: () => setModalOpen(false)
      };
    }

    if (status === 'downloaded') {
      return {
        okText: 'Install Now',
        cancelText: 'Later',
        onOk: installUpdate,
        onCancel: () => setModalOpen(false)
      };
    }

    if (status === 'installing') {
      return {
        okText: 'Installing...',
        cancelText: 'Cancel',
        onOk: () => {},
        onCancel: () => {}
      };
    }

    if (updateAvailable) {
      return {
        okText: 'Download',
        cancelText: 'Later',
        onOk: startDownload,
        onCancel: () => setModalOpen(false)
      };
    }

    return {
      okText: 'OK',
      cancelText: 'Close',
      onOk: () => setModalOpen(false),
      onCancel: () => setModalOpen(false)
    };
  };

  useEffect(() => {
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable);
    window.ipcRenderer.on('update-error', onUpdateError);
    window.ipcRenderer.on('download-progress', onDownloadProgress);

    return () => {
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable);
      window.ipcRenderer.off('update-error', onUpdateError);
      window.ipcRenderer.off('download-progress', onDownloadProgress);
    };
  }, [onUpdateCanAvailable, onUpdateError, onDownloadProgress]);

  const modalButtons = getModalButtons();

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalButtons.cancelText}
        okText={modalButtons.okText}
        onCancel={modalButtons.onCancel}
        onOk={modalButtons.onOk}>

        <div className="modal-slot">
          {updateError ?
          <div>
              <p>Error checking for updates.</p>
              <p>{updateError.message}</p>
              <p className="website-fallback">
                <span
                className="website-link"
                onClick={openDownloadPage}>

                  Download from website instead
                </span>
              </p>
            </div> :
          status === 'downloading' ?
          <div>
              <div className="update-available-title">Downloading Update...</div>
              <div className="download-progress-container">
                <div className="progress-bar">
                  <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress.progress}%` }} />

                </div>
                <div className="progress-text">
                  {downloadProgress.progress}% - {formatBytes(downloadProgress.downloaded)} / {formatBytes(downloadProgress.total)}
                </div>
              </div>
              <p className="update-instruction">
                Please wait while the update is being downloaded...
              </p>
              <p className="website-fallback">
                Having issues? <span className="website-link" onClick={openDownloadPage}>Download from website</span>
              </p>
            </div> :
          status === 'downloaded' ?
          <div>
              <div className="update-available-title">Download Complete!</div>
              <div className="new-version__target">
                v{versionInfo?.version} → v{versionInfo?.newVersion}
              </div>
              <p className="update-instruction">
                Click "Install Now" to close the app and run the installer.
                The new version will replace the current version.
              </p>
            </div> :
          status === 'installing' ?
          <div>
              <div className="update-available-title">Installing Update...</div>
              <p className="update-instruction">
                The installer is starting. The app will close automatically.
              </p>
            </div> :
          updateAvailable ?
          <div>
              <div className="update-available-title">New Update Available!</div>
              <div className="new-version__target">
                v{versionInfo?.version} → v{versionInfo?.newVersion}
              </div>
              <p className="update-instruction">
                Click "Download" to download the update within the app.
              </p>
              <p className="website-fallback">
                Or <span className="website-link" onClick={openDownloadPage}>download from website</span>
              </p>
            </div> :

          <div className="can-not-available">
              {versionInfo?.version ?
            `You are on the latest version: v${versionInfo.version}` :
            `Checking version...`}
            </div>
          }
        </div>
      </Modal>

      <button disabled={status === 'checking'} onClick={checkUpdate}>
        {status === 'checking' ? 'Checking...' : 'Check for Updates'}
      </button>
    </>);

};

export default Update;