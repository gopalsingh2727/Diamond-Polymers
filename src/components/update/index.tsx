import { useCallback, useEffect, useState } from 'react';
import type { ProgressInfo } from 'electron-updater';
import Modal from './Modal/index';
import Progress from './Progress/index';
import './update.css';

type VersionInfo = {
  version: string;
  newVersion: string;
  update: boolean;
};

type ErrorType = {
  message: string;
  [key: string]: any;
};

const Update = () => {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => window.ipcRenderer.invoke('start-download'),
  });

  const checkUpdate = async () => {
    setChecking(true);
    const result = await window.ipcRenderer.invoke('check-update');
    setProgressInfo({ percent: 0 });
    setChecking(false);
    setModalOpen(true);

    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, info: VersionInfo) => {
      setVersionInfo(info);
      setUpdateError(undefined);

      if (info.update) {
        setUpdateAvailable(true);
        setModalBtn({
          cancelText: 'Cancel',
          okText: 'Update',
          onCancel: () => setModalOpen(false),
          onOk: () => window.ipcRenderer.invoke('start-download'),
        });
      } else {
        setUpdateAvailable(false);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, err: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(err);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, progress: ProgressInfo) => {
      setProgressInfo(progress);
    },
    []
  );

  const onUpdateDownloaded = useCallback((_event: Electron.IpcRendererEvent) => {
    setProgressInfo({ percent: 100 });
    setModalBtn({
      cancelText: 'Later',
      okText: 'Install now',
      onCancel: () => setModalOpen(false),
      onOk: () => window.ipcRenderer.invoke('quit-and-install'),
    });
  }, []);

  useEffect(() => {
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable);
    window.ipcRenderer.on('update-error', onUpdateError);
    window.ipcRenderer.on('download-progress', onDownloadProgress);
    window.ipcRenderer.on('update-downloaded', onUpdateDownloaded);

    return () => {
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable);
      window.ipcRenderer.off('update-error', onUpdateError);
      window.ipcRenderer.off('download-progress', onDownloadProgress);
      window.ipcRenderer.off('update-downloaded', onUpdateDownloaded);
    };
  }, [onUpdateCanAvailable, onUpdateError, onDownloadProgress, onUpdateDownloaded]);

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalBtn.cancelText}
        okText={modalBtn.okText}
        onCancel={modalBtn.onCancel}
        onOk={modalBtn.onOk}
        footer={updateAvailable ? null : undefined}
      >
        <div className="modal-slot">
          {updateError ? (
            <div>
              <p>Error downloading the latest version.</p>
              <p>{updateError.message}</p>
            </div>
          ) : updateAvailable ? (
            <div>
              <div>New version available: v{versionInfo?.newVersion}</div>
              <div className="new-version__target">
                v{versionInfo?.version} → v{versionInfo?.newVersion}
              </div>
              <div className="update__progress">
                <div className="progress__title">Update progress:</div>
                <div className="progress__bar">
                  <Progress percent={progressInfo?.percent} />
                </div>
              </div>
            </div>
          ) : (
            <div className="can-not-available">
              {versionInfo?.version
                ? `You are already on the latest version: v${versionInfo.version}`
                : `Unable to check version at the moment.`}
            </div>
          )}
        </div>
      </Modal>

      <button disabled={checking} onClick={checkUpdate}>
        {checking ? 'Checking...' : 'Check update'}
      </button>
    </>
  );
};

export default Update;