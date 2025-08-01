import { Alert, Input, Space } from 'antd';
import { Empty } from '../../../controls/empty/empty';
import { Feature } from '../../../../models/feature';
import { FeaturePanel } from '../../../panels/elements/feature-panel/feature-panel';
import { Hero } from '../../../../models/hero';
import { Modal } from '../../modal/modal';
import { Options } from '../../../../models/options';
import { PanelMode } from '../../../../enums/panel-mode';
import { SearchOutlined } from '@ant-design/icons';
import { SelectablePanel } from '../../../controls/selectable-panel/selectable-panel';
import { Title } from '../../../../models/title';
import { TitlePanel } from '../../../panels/elements/title-panel/title-panel';
import { Utils } from '../../../../utils/utils';
import { useState } from 'react';

import './title-select-modal.scss';

interface Props {
	titles: Title[];
	hero: Hero;
	options: Options;
	onClose: () => void;
	onSelect: (title: Title) => void;
}

export const TitleSelectModal = (props: Props) => {
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const [ selectedTitle, setSelectedTitle ] = useState<Title | null>(null);

	try {
		const selectTitle = (title: Title) => {
			const copy = Utils.copy(title);
			if (copy.features.length === 1) {
				copy.selectedFeatureID = copy.features[0].id;
				props.onSelect(copy);
			}
			setSelectedTitle(copy);
		};

		const selectFeature = (feature: Feature) => {
			if (selectedTitle) {
				selectedTitle.selectedFeatureID = feature.id;
				props.onSelect(selectedTitle);
			}
		};

		const titles = props.titles
			.filter(t => Utils.textMatches([
				t.name,
				t.description
			], searchTerm));

		return (
			<Modal
				toolbar={
					<>
						<Input
							name='search'
							placeholder='Search'
							allowClear={true}
							value={searchTerm}
							suffix={<SearchOutlined />}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</>
				}
				content={
					<div className='title-select-modal'>
						{
							selectedTitle === null ?
								<Space direction='vertical' style={{ width: '100%' }}>
									{
										titles.map(t => (
											<SelectablePanel
												key={t.id}
												onSelect={() => selectTitle(t)}
											>
												<TitlePanel title={t} hero={props.hero} mode={PanelMode.Full} options={props.options} />
											</SelectablePanel>
										))
									}
									{
										titles.length === 0 ?
											<Empty />
											: null
									}
								</Space>
								:
								<Space direction='vertical' style={{ width: '100%' }}>
									<SelectablePanel action={{ label: 'Unselect', onClick: () => setSelectedTitle(null) }}>
										<TitlePanel title={selectedTitle} hero={props.hero} options={props.options} />
									</SelectablePanel>
									<Alert
										type='info'
										showIcon={true}
										message='This title has multiple options; choose one of them.'
									/>
									{
										selectedTitle.features.map(f => (
											<SelectablePanel
												key={f.id}
												onSelect={() => selectFeature(f)}
											>
												<FeaturePanel feature={f} hero={props.hero} mode={PanelMode.Full} options={props.options} />
											</SelectablePanel>
										))
									}
									{
										selectedTitle.features.length === 0 ?
											<Empty />
											: null
									}
								</Space>
						}
					</div>
				}
				onClose={props.onClose}
			/>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
