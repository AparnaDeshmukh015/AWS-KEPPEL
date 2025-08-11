// LoaderManager.ts
class LoaderManager {
    private static instance: LoaderManager;
    public isLoading: boolean = false;
    private listeners: Array<(loading: boolean) => void> = [];

    private constructor() { }

    public static getInstance(): LoaderManager {
        if (!LoaderManager.instance) {
            LoaderManager.instance = new LoaderManager();
        }
        return LoaderManager.instance;
    }

    public addListener(callback: (loading: boolean) => void) {
        this.listeners.push(callback);
    }

    public show() {
        this.isLoading = true;
        this.notify();
    }

    public hide() {
        this.isLoading = false;
        this.notify();
    }

    private notify() {
        this.listeners.forEach(callback => callback(this.isLoading));
    }
}

export default LoaderManager.getInstance();
