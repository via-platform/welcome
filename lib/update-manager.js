const {Emitter, CompositeDisposable} = require('via');

const Unsupported = 'unsupported';
const Idle = 'idle';
const CheckingForUpdate = 'checking';
const DownloadingUpdate = 'downloading';
const UpdateAvailableToInstall = 'update-available';
const UpToDate = 'no-update-available';
const ErrorState = 'error';

module.exports = class UpdateManager {
    constructor(){
        this.emitter = new Emitter();
        this.currentVersion = via.getVersion();
        this.availableVersion = via.getVersion();
        this.subscriptions = new CompositeDisposable();
        this.resetState();
        this.listenForViaEvents();

        this.state = {
            Unsupported,
            Idle,
            CheckingForUpdate,
            DownloadingUpdate,
            UpdateAvailableToInstall,
            UpToDate,
            Error: ErrorState
        };
    }

    listenForViaEvents(){
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
            via.autoUpdater.onDidBeginCheckingForUpdate(() => this.setState(CheckingForUpdate)),
            via.autoUpdater.onDidBeginDownloadingUpdate(() => this.setState(DownloadingUpdate)),
            via.autoUpdater.onDidCompleteDownloadingUpdate(({releaseVersion}) => this.setAvailableVersion(releaseVersion)),
            via.autoUpdater.onUpdateNotAvailable(() => this.setState(UpToDate)),
            via.autoUpdater.onUpdateError(() => this.setState(ErrorState)),
                via.config.observe('core.automaticallyUpdate', value => {
                this.autoUpdatesEnabled = value;
                this.emitDidChange();
            })
        );
    }

    dispose(){
        this.subscriptions.dispose();
    }

    onDidChange(callback){
        return this.emitter.on('did-change', callback);
    }

    emitDidChange(){
        this.emitter.emit('did-change');
    }

    getAutoUpdatesEnabled(){
        return this.autoUpdatesEnabled && this.state !== UpdateManager.State.Unsupported;
    }

    setAutoUpdatesEnabled(enabled){
        return via.config.set('core.automaticallyUpdate', enabled);
    }

    getErrorMessage(){
        return via.autoUpdater.getErrorMessage();
    }

    getState(){
        return this.state;
    }

    setState(state){
        this.state = state;
        this.emitDidChange();
    }

    resetState(){
        this.state = via.autoUpdater.platformSupportsUpdates() ? via.autoUpdater.getState() : Unsupported;
        this.emitDidChange();
    }

    getAvailableVersion(){
        return this.availableVersion;
    }

    setAvailableVersion (version) {
        this.availableVersion = version;

        if(this.availableVersion !== this.currentVersion){
            this.state = UpdateAvailableToInstall;
        }else{
            this.state = UpToDate;
        }

        this.emitDidChange();
    }

    checkForUpdate(){
        via.autoUpdater.checkForUpdate();
    }

    restartAndInstallUpdate(){
        via.autoUpdater.restartAndInstallUpdate();
    }

    getReleaseNotesURLForCurrentVersion(){
        return this.getReleaseNotesURLForVersion(this.currentVersion);
    }

    getReleaseNotesURLForAvailableVersion(){
        return this.getReleaseNotesURLForVersion(this.availableVersion);
    }

    getReleaseNotesURLForVersion(appVersion){
        const releaseRepo = appVersion.indexOf('nightly') > -1 ? 'via-nightly-releases' : 'via';
        return `https://github.com/via-platform/${releaseRepo}/releases/tag/${appVersion}`;
    }
}
