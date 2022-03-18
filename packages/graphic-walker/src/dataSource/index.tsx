import { observer } from 'mobx-react-lite';
import React from 'react';
import { Container } from '../components/container';
import Modal from '../components/modal';
// import DataSourcePanel from './pannel';
import DataSelection from './dataSelection';
import { useGlobalStore } from '../store';
import { CheckCircleIcon, RefreshIcon } from '@heroicons/react/outline';

interface DSSegmentProps {
    preWorkDone: boolean;
}

const DataSourceSegment: React.FC<DSSegmentProps> = props => {
    const { preWorkDone } = props;
    const { commonStore } = useGlobalStore();

    const { currentDataset, datasets, showDSPanel } = commonStore;

    return <Container>
        {!preWorkDone && <div className="animate-spin inline-block mr-2 ml-2 w-4 h-4 rounded-full border-t-2 border-l-2 border-blue-500"></div>}
        <label className="text-xs mr-1">当前数据集</label>
        <select
            className="border border-gray-500 rounded-sm text-xs pt-0.5 pb-0.5 pl-2 pr-2"
            value={currentDataset.id}
            onChange={(e) => { commonStore.useDS(e.target.value); }}
        >
            {datasets.map((ds) => (
                <option value={ds.id} key={ds.id}>
                    {ds.name}
                </option>
            ))}
        </select>

        <button className="inline-block min-w-96 text-xs ml-2 pt-1 pb-1 pl-6 pr-6 border border-gray-500 rounded-sm hover:bg-gray-200"
            onClick={() => { commonStore.startDSBuildingTask() }}
        >创建数据集</button>
        {showDSPanel && (
            <Modal
                title="创建数据源"
                onClose={() => { commonStore.setShowDSPanel(false) }}
            >
                <DataSelection />
                {/* <DataSourcePanel /> */}
            </Modal>
        )}
        { preWorkDone && <CheckCircleIcon className="text-green-500 w-5 inline-block ml-2" /> }
        { !preWorkDone && <RefreshIcon className="text-yellow-500 w-5 inline-block ml-2" />}
    </Container>
}

export default observer(DataSourceSegment);