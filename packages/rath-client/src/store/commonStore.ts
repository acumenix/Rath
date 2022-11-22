import { makeAutoObservable, observable, runInAction } from 'mobx';
import { Specification } from 'visual-insights';
import { COMPUTATION_ENGINE, EXPLORE_MODE, PIVOT_KEYS } from '../constants';
import { ITaskTestMode, IVegaSubset } from '../interfaces';
import { destroyRathWorker, initRathWorker, rathEngineService } from '../services/index';
import { transVegaSubset2Schema } from '../utils/transform';
import { getDataConfig, updateDataConfig } from '../utils/storage';
import { getGlobalStore } from '.';

export type ErrorType = 'error' | 'info' | 'success';
const TASK_TEST_MODE_COOKIE_KEY = 'task_test_mode'
export class CommonStore {
    public appKey: string = PIVOT_KEYS.dataSource;
    public computationEngine: string = COMPUTATION_ENGINE.webworker;
    public exploreMode: string = EXPLORE_MODE.comprehensive;
    public taskMode: ITaskTestMode = ITaskTestMode.local;
    public messages: Array<{type: ErrorType, content: string}> = []; //[{type:'error', content: 'This is a test.'}];
    public showStorageModal: boolean = false;
    public showAnalysisConfig: boolean = false;
    public navMode: 'text' | 'icon' = 'text';
    public graphicWalkerSpec: Specification;
    public vizSpec: IVegaSubset | null = null;
    public configKey: string = '';
    public configOpen: boolean = false;
    constructor() {
        const taskMode = localStorage.getItem(TASK_TEST_MODE_COOKIE_KEY) || ITaskTestMode.local;
        this.taskMode = taskMode as ITaskTestMode;
        this.graphicWalkerSpec = {}
        makeAutoObservable(this, {
            graphicWalkerSpec: observable.ref
        });
    }
    public setAppKey (key: string) {
        this.appKey = key
    }
    public showError (type: ErrorType, content: string) {
        this.messages.push({
            type,
            content
        })
    }
    public visualAnalysisInGraphicWalker (spec: IVegaSubset) {
        this.graphicWalkerSpec = transVegaSubset2Schema(spec);
        this.appKey = PIVOT_KEYS.editor;
    }
    public setNavMode (mode: 'text' | 'icon') {
        this.navMode = mode;
    }
    public setTaskTestMode (mode: ITaskTestMode) {
        this.taskMode = mode;
        localStorage.setItem(TASK_TEST_MODE_COOKIE_KEY, mode)
    }
    public setShowAnalysisConfig (show: boolean) {
        this.showAnalysisConfig = show;
    }
    public removeError (errIndex: number) {
        this.messages.splice(errIndex, 1);
    }
    public setShowStorageModal (show: boolean) {
        this.showStorageModal = show;
    }
    public async setComputationEngine(engine: string) {
        try {
            destroyRathWorker();
            initRathWorker(engine);
            await rathEngineService({
                task: 'init',
                props: engine
            })
            runInAction(() => {
                this.computationEngine = engine;
            })
        } catch (error) {
            console.error(error);
        }
    }
    public async setExploreMode(mode: string) {
        this.exploreMode = mode;
    }
    public async configurePersistence() {
        const ltsPipeLineStore = getGlobalStore().ltsPipeLineStore;
        const dataSourcematic = {
            cubeStorageManageMode: ltsPipeLineStore.cubeStorageManageMode,
            exploreMode: this.exploreMode,
            computationEngine: this.computationEngine,
            taskMode: this.taskMode,
        };
        updateDataConfig('dataSource', dataSourcematic);
    }
    public async getConfigurePersistence() {
        const ltsPipeLineStore = getGlobalStore().ltsPipeLineStore;
        getDataConfig('dataSource').then((res) => {
            if (res) {
                const result = JSON.parse(res);
                ltsPipeLineStore.cubeStorageManageMode = result.cubeStorageManageMode;
                this.exploreMode = result.exploreMode;
                this.computationEngine = result.computationEngine;
                this.taskMode = result.taskMode;
            }
        });
    }
}
