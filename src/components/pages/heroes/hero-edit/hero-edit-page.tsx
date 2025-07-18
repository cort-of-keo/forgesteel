import { Alert, AutoComplete, Button, Divider, Drawer, Flex, Input, Radio, Segmented, Select, Space, Upload } from 'antd';
import { CloseOutlined, DownloadOutlined, InfoCircleOutlined, SaveOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CultureData, EnvironmentData, OrganizationData, UpbringingData } from '../../../../data/culture-data';
import { Feature, FeatureData } from '../../../../models/feature';
import { Hero, HeroEditTab } from '../../../../models/hero';
import { ReactNode, useMemo, useState } from 'react';
import { Ancestry } from '../../../../models/ancestry';
import { AncestryPanel } from '../../../panels/elements/ancestry-panel/ancestry-panel';
import { AppFooter } from '../../../panels/app-footer/app-footer';
import { AppHeader } from '../../../panels/app-header/app-header';
import { Career } from '../../../../models/career';
import { CareerPanel } from '../../../panels/elements/career-panel/career-panel';
import { Characteristic } from '../../../../enums/characteristic';
import { ClassPanel } from '../../../panels/elements/class-panel/class-panel';
import { Collections } from '../../../../utils/collections';
import { Complication } from '../../../../models/complication';
import { ComplicationPanel } from '../../../panels/elements/complication-panel/complication-panel';
import { Culture } from '../../../../models/culture';
import { CulturePanel } from '../../../panels/elements/culture-panel/culture-panel';
import { Element } from '../../../../models/element';
import { ErrorBoundary } from '../../../controls/error-boundary/error-boundary';
import { FeatureLogic } from '../../../../logic/feature-logic';
import { FeaturePanel } from '../../../panels/elements/feature-panel/feature-panel';
import { FeatureType } from '../../../../enums/feature-type';
import { Field } from '../../../controls/field/field';
import { Format } from '../../../../utils/format';
import { HeaderText } from '../../../controls/header-text/header-text';
import { HeroClass } from '../../../../models/class';
import { HeroLogic } from '../../../../logic/hero-logic';
import { LanguageType } from '../../../../enums/language-type';
import { Modal } from '../../../modals/modal/modal';
import { NameGenerator } from '../../../../utils/name-generator';
import { NumberSpin } from '../../../controls/number-spin/number-spin';
import { Options } from '../../../../models/options';
import { PanelMode } from '../../../../enums/panel-mode';
import { SelectablePanel } from '../../../controls/selectable-panel/selectable-panel';
import { Sourcebook } from '../../../../models/sourcebook';
import { SourcebookLogic } from '../../../../logic/sourcebook-logic';
import { SubClass } from '../../../../models/subclass';
import { SubclassPanel } from '../../../panels/elements/subclass-panel/subclass-panel';
import { Utils } from '../../../../utils/utils';
import { useMediaQuery } from '../../../../hooks/use-media-query';
import { useNavigation } from '../../../../hooks/use-navigation';
import { useParams } from 'react-router';

import './hero-edit-page.scss';

enum PageState {
	Blank = '',
	Optional = 'Optional',
	NotStarted = 'Not Started',
	InProgress = 'In Progress',
	Completed = 'Completed'
}

const matchElement = (element: Element, searchTerm: string) => {
	const name = element.name.toLowerCase();
	const desc = element.description.toLowerCase();
	return searchTerm
		.toLowerCase()
		.split(' ')
		.some(token => name.includes(token) || desc.includes(token));
};

interface Props {
	heroes: Hero[];
	sourcebooks: Sourcebook[];
	options: Options;
	showDirectory: () => void;
	showAbout: () => void;
	showRoll: () => void;
	showReference: () => void;
	showSourcebooks: () => void;
	saveChanges: (hero: Hero) => void;
	importSourcebook: (sourcebook: Sourcebook) => void;
}

export const HeroEditPage = (props: Props) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');
	const navigation = useNavigation();
	const { heroID, page } = useParams<{ heroID: string; page: HeroEditTab }>();
	const originalHero = useMemo(() => props.heroes.find(h => h.id === heroID)!, [ heroID, props.heroes ]);
	const [ hero, setHero ] = useState<Hero>(Utils.copy(originalHero));
	const [ dirty, setDirty ] = useState<boolean>(false);
	const [ searchTerm, setSearchTerm ] = useState<string>('');

	try {
		const isChosen = (feature: Feature, hero: Hero) => {
			switch (feature.type) {
				case FeatureType.AncestryChoice:
					return !!feature.data.selected;
				case FeatureType.AncestryFeatureChoice:
					return !!feature.data.selected;
				case FeatureType.Choice: {
					let availableOptions = [ ...feature.data.options ];
					if (availableOptions.some(opt => opt.feature.type === FeatureType.AncestryFeatureChoice)) {
						availableOptions = availableOptions.filter(opt => opt.feature.type !== FeatureType.AncestryFeatureChoice);
						const additionalOptions = HeroLogic.getFormerAncestries(hero)
							.flatMap(a => a.features)
							.filter(f => f.type === FeatureType.Choice)
							.flatMap(f => f.data.options)
							.filter(opt => opt.feature.type !== FeatureType.AncestryFeatureChoice);
						availableOptions.push(...additionalOptions);
					}
					const selected = feature.data.selected
						.map(f => availableOptions.find(opt => opt.feature.id === f.id))
						.filter(opt => !!opt);
					return Collections.sum(selected, i => i.value) >= feature.data.count;
				}
				case FeatureType.ClassAbility:
					return feature.data.selectedIDs.length >= feature.data.count;
				case FeatureType.Companion:
					return feature.data.selected !== null;
				case FeatureType.Domain:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.DomainFeature:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.ItemChoice:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.Kit:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.LanguageChoice:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.Perk:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.SkillChoice:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.TaggedFeatureChoice:
					return feature.data.selected.length >= feature.data.count;
				case FeatureType.TitleChoice:
					return feature.data.selected.length >= feature.data.count;
			};

			return true;
		};

		const getPageState = (page: HeroEditTab) => {
			switch (page) {
				case 'start':
					return PageState.Blank;
				case 'ancestry':
					if (hero.ancestry) {
						return (hero.ancestry.features.filter(f => FeatureLogic.isChoice(f)).filter(f => !isChosen(f, hero)).length > 0) ? PageState.InProgress : PageState.Completed;
					} else {
						return PageState.NotStarted;
					}
				case 'culture':
					if (hero.culture) {
						if (hero.culture.languages.length === 0) {
							return PageState.InProgress;
						}
						if (!hero.culture.environment || !hero.culture.organization || !hero.culture.upbringing) {
							return PageState.InProgress;
						}
						const features: Feature[] = [];
						if (hero.culture.environment) {
							features.push(hero.culture.environment);
						}
						if (hero.culture.organization) {
							features.push(hero.culture.organization);
						}
						if (hero.culture.upbringing) {
							features.push(hero.culture.upbringing);
						}
						return (features.filter(f => FeatureLogic.isChoice(f)).filter(f => !isChosen(f, hero)).length > 0) ? PageState.InProgress : PageState.Completed;
					} else {
						return PageState.NotStarted;
					}
				case 'career':
					if (hero.career) {
						return (hero.career.features.filter(f => FeatureLogic.isChoice(f)).filter(f => !isChosen(f, hero)).length > 0) ? PageState.InProgress : PageState.Completed;
					} else {
						return PageState.NotStarted;
					}
				case 'class':
					if (hero.class) {
						if (hero.class.characteristics.every(ch => ch.value === 0)) {
							return PageState.InProgress;
						}
						if (hero.class.subclasses.filter(sc => sc.selected).length < hero.class.subclassCount) {
							return PageState.InProgress;
						}
						const level = hero.class.level;
						const features: Feature[] = [];
						hero.class.featuresByLevel
							.filter(lvl => lvl.level <= level)
							.forEach(lvl => features.push(...lvl.features));
						hero.class.subclasses
							.filter(sc => sc.selected)
							.forEach(sc => {
								sc.featuresByLevel
									.filter(lvl => lvl.level <= level)
									.forEach(lvl => features.push(...lvl.features));
							});
						return (features.filter(f => FeatureLogic.isChoice(f)).filter(f => !isChosen(f, hero)).length > 0) ? PageState.InProgress : PageState.Completed;
					} else {
						return PageState.NotStarted;
					}
				case 'complication':
					if (hero.complication) {
						return (hero.complication.features.filter(f => FeatureLogic.isChoice(f)).filter(f => !isChosen(f, hero)).length > 0) ? PageState.InProgress : PageState.Completed;
					} else {
						return PageState.Optional;
					}
				case 'details':
					if (hero.name) {
						return PageState.Completed;
					} else {
						return PageState.NotStarted;
					}
			}
		};

		const setAncestry = (ancestry: Ancestry | null) => {
			const ancestryCopy = Utils.copy(ancestry) as Ancestry | null;
			const heroCopy = Utils.copy(hero);
			heroCopy.ancestry = ancestryCopy;
			setHero(heroCopy);
			setDirty(true);
		};

		const setCulture = (culture: Culture | null) => {
			const cultureCopy = Utils.copy(culture) as Culture | null;
			const heroCopy = Utils.copy(hero);
			heroCopy.culture = cultureCopy;
			setHero(heroCopy);
			setDirty(true);
		};

		const setLanguages = (languages: string[]) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.culture) {
				heroCopy.culture.languages = languages;
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setEnvironment = (id: string | null) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.culture) {
				const env = EnvironmentData.getEnvironments().find(e => e.id === id);
				if (env) {
					const envCopy = Utils.copy(env) as Feature;
					heroCopy.culture.environment = envCopy;
				} else {
					heroCopy.culture.environment = null;
				}
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setOrganization = (id: string | null) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.culture) {
				const org = OrganizationData.getOrganizations().find(o => o.id === id);
				if (org) {
					const orgCopy = Utils.copy(org) as Feature;
					heroCopy.culture.organization = orgCopy;
				} else {
					heroCopy.culture.organization = null;
				}
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setUpbringing = (id: string | null) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.culture) {
				const ub = UpbringingData.getUpbringings().find(u => u.id === id);
				if (ub) {
					const ubCopy = Utils.copy(ub) as Feature;
					heroCopy.culture.upbringing = ubCopy;
				} else {
					heroCopy.culture.upbringing = null;
				}
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setCareer = (career: Career | null) => {
			const careerCopy = Utils.copy(career) as Career | null;
			const heroCopy = Utils.copy(hero);
			heroCopy.career = careerCopy;
			setHero(heroCopy);
			setDirty(true);
		};

		const setIncitingIncident = (id: string | null) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.career) {
				heroCopy.career.incitingIncidents.selectedID = id;
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setClass = (heroClass: HeroClass | null) => {
			const classCopy = Utils.copy(heroClass) as HeroClass | null;
			if (classCopy) {
				if (classCopy.primaryCharacteristicsOptions.length === 1) {
					classCopy.primaryCharacteristics = classCopy.primaryCharacteristicsOptions[0];
				}
			}
			const heroCopy = Utils.copy(hero);
			heroCopy.class = classCopy;
			setHero(heroCopy);
			setDirty(true);
		};

		const setLevel = (level: number) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.class) {
				heroCopy.class.level = level;
				heroCopy.state.xp = HeroLogic.getMinXP(level);
			}
			HeroLogic
				.getCompanions(heroCopy)
				.forEach(m => {
					if (m.retainer) {
						m.retainer.level = Math.max(m.level, level);
					}
				});
			setHero(heroCopy);
			setDirty(true);
		};

		const setPrimaryCharacteristics = (characteristics: Characteristic[]) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.class) {
				heroCopy.class.primaryCharacteristics = characteristics;
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setCharacteristics = (array: { characteristic: Characteristic, value: number }[]) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.class) {
				heroCopy.class.characteristics = array;
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setSubclasses = (subclassIDs: string[]) => {
			const heroCopy = Utils.copy(hero);
			if (heroCopy.class) {
				heroCopy.class.subclasses.forEach(sc => sc.selected = (subclassIDs || []).includes(sc.id));
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setComplication = (complication: Complication | null) => {
			const complicationCopy = Utils.copy(complication) as Complication | null;
			const heroCopy = Utils.copy(hero);
			heroCopy.complication = complicationCopy;
			setHero(heroCopy);
			setDirty(true);
		};

		const setFeatureData = (featureID: string, data: FeatureData) => {
			const heroCopy = Utils.copy(hero);
			const feature = HeroLogic.getFeatures(heroCopy)
				.map(f => f.feature)
				.find(f => f.id === featureID);
			if (feature) {
				feature.data = data;
			}
			setHero(heroCopy);
			setDirty(true);
		};

		const setName = (value: string) => {
			const heroCopy = Utils.copy(hero);
			heroCopy.name = value;
			setHero(heroCopy);
			setDirty(true);
		};

		const setFolder = (value: string) => {
			const heroCopy = Utils.copy(hero);
			heroCopy.folder = value;
			setHero(heroCopy);
			setDirty(true);
		};

		const setSettingIDs = (settingIDs: string[]) => {
			const heroCopy = Utils.copy(hero);
			heroCopy.settingIDs = settingIDs;
			setHero(heroCopy);
			setDirty(true);
		};

		const saveChanges = () => {
			props.saveChanges(hero);
			setDirty(false);
		};

		const selectRandom = () => {
			switch (page) {
				case 'ancestry':
					setAncestry(Collections.draw(SourcebookLogic.getAncestries(props.sourcebooks)));
					break;
				case 'culture':
					setCulture(Collections.draw([ CultureData.bespoke, ...SourcebookLogic.getCultures(props.sourcebooks) ]));
					break;
				case 'career':
					setCareer(Collections.draw(SourcebookLogic.getCareers(props.sourcebooks)));
					break;
				case 'class':
					setClass(Collections.draw(SourcebookLogic.getClasses(props.sourcebooks)));
					break;
				case 'complication':
					setComplication(Collections.draw(SourcebookLogic.getComplications(props.sourcebooks)));
					break;
			}
		};

		const getControls = () => {
			let allowRandom = false;
			let unselect = undefined;
			switch (page) {
				case 'ancestry':
					allowRandom = !hero.ancestry;
					unselect = hero.ancestry ? () => setAncestry(null) : undefined;
					break;
				case 'culture':
					allowRandom = !hero.culture;
					unselect = hero.culture ? () => setCulture(null) : undefined;
					break;
				case 'career':
					allowRandom = !hero.career;
					unselect = hero.career ? () => setCareer(null) : undefined;
					break;
				case 'class':
					allowRandom = !hero.class;
					unselect = hero.class ? () => setClass(null) : undefined;
					break;
				case 'complication':
					allowRandom = !hero.complication;
					unselect = hero.complication ? () => setComplication(null) : undefined;
					break;
			}

			return (
				<div className='page-controls'>
					{
						isSmall ?
							<Select
								style={{ width: '100%' }}
								options={([
									'start',
									'ancestry',
									'culture',
									'career',
									'class',
									'complication',
									'details'
								] as const).map(tab => ({
									value: tab,
									label: <div className='ds-text'>{Format.capitalize(tab, '-')}</div>
								}))}
								value={page}
								onChange={value => navigation.goToHeroEdit(heroID!, value)}
							/>
							:
							<Segmented
								name='sections'
								style={{ flex: '1 1 0' }}
								options={([
									'start',
									'ancestry',
									'culture',
									'career',
									'class',
									'complication',
									'details'
								] as const).map(tab => ({
									value: tab,
									label: (
										<div className={`page-button ${getPageState(tab).toLowerCase().replace(' ', '-')}`}>
											<div className='page-button-title'>{Format.capitalize(tab, '-')}</div>
											<div className='page-button-subtitle'>{getPageState(tab)}</div>
										</div>
									)
								}))}
								block={true}
								value={page}
								onChange={value => navigation.goToHeroEdit(heroID!, value)}
							/>
					}
					<Space direction='vertical' size={4}>
						{!isSmall ? <Button disabled={!allowRandom || !!searchTerm} icon={<ThunderboltOutlined />} onClick={selectRandom}>Random</Button> : null}
						<Button disabled={!unselect} icon={<CloseOutlined />} onClick={unselect}>Unselect</Button>
					</Space>
				</div>
			);
		};

		const allowSearch = () => {
			switch (page) {
				case 'ancestry':
					return !hero.ancestry;
				case 'culture':
					return !hero.culture;
				case 'career':
					return !hero.career;
				case 'class':
					return !hero.class;
				case 'complication':
					return !hero.complication;
			}

			return false;
		};

		const getContent = () => {
			switch (page) {
				case 'start':
					return (
						<StartSection
							hero={hero}
							sourcebooks={props.sourcebooks}
							setSettingIDs={setSettingIDs}
							importSourcebook={props.importSourcebook}
						/>
					);
				case 'ancestry':
					return (
						<AncestrySection
							hero={hero}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							searchTerm={searchTerm}
							selectAncestry={setAncestry}
							setFeatureData={setFeatureData}
						/>
					);
				case 'culture':
					return (
						<CultureSection
							hero={hero}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							searchTerm={searchTerm}
							selectCulture={setCulture}
							selectLanguages={setLanguages}
							selectEnvironment={setEnvironment}
							selectOrganization={setOrganization}
							selectUpbringing={setUpbringing}
							setFeatureData={setFeatureData}
						/>
					);
				case 'career':
					return (
						<CareerSection
							hero={hero}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							searchTerm={searchTerm}
							selectCareer={setCareer}
							selectIncitingIncident={setIncitingIncident}
							setFeatureData={setFeatureData}
						/>
					);
				case 'class':
					return (
						<ClassSection
							hero={hero}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							searchTerm={searchTerm}
							selectClass={setClass}
							setLevel={setLevel}
							selectPrimaryCharacteristics={setPrimaryCharacteristics}
							selectCharacteristics={setCharacteristics}
							selectSubclasses={setSubclasses}
							setFeatureData={setFeatureData}
						/>
					);
				case 'complication':
					return (
						<ComplicationSection
							hero={hero}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							searchTerm={searchTerm}
							selectComplication={setComplication}
							setFeatureData={setFeatureData}
						/>
					);
				case 'details':
					return (
						<DetailsSection
							hero={hero}
							allHeroes={props.heroes}
							sourcebooks={props.sourcebooks.filter(cs => hero.settingIDs.includes(cs.id))}
							options={props.options}
							setName={setName}
							setFolder={setFolder}
							setFeatureData={setFeatureData}
						/>
					);
			}
		};

		return (
			<ErrorBoundary>
				<div className='hero-edit-page'>
					<AppHeader subheader='Hero Builder' showDirectory={props.showDirectory}>
						<Input
							name='search'
							placeholder='Search'
							disabled={!allowSearch()}
							allowClear={true}
							value={searchTerm}
							suffix={<SearchOutlined />}
							onChange={e => setSearchTerm(e.target.value)}
						/>
						<div className='divider' />
						<Button icon={<SaveOutlined />} type='primary' disabled={!dirty} onClick={saveChanges}>
							Save Changes
						</Button>
						<Button icon={<CloseOutlined />} onClick={() => navigation.goToHeroView(heroID!)}>
							Cancel
						</Button>
					</AppHeader>
					<div className={isSmall ? 'hero-edit-page-content small' : 'hero-edit-page-content'}>
						{getControls()}
						{getContent()}
					</div>
					<AppFooter page='heroes' heroes={props.heroes} showAbout={props.showAbout} showRoll={props.showRoll} showReference={props.showReference} showSourcebooks={props.showSourcebooks} />
				</div>
			</ErrorBoundary>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface StartSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	setSettingIDs: (settingIDs: string[]) => void;
	importSourcebook: (sourcebook: Sourcebook) => void;
}

const StartSection = (props: StartSectionProps) => {
	try {
		return (
			<div className='hero-edit-content'>
				<div className='hero-edit-content-column single-column choices'>
					<HeaderText>Creating a Hero</HeaderText>
					<div className='ds-text'>
						Creating a hero in <b>FORGE STEEL</b> is simple.
					</div>
					<ul>
						<li>
							Use the tabs above to select your hero's <code>Ancestry</code>, <code>Culture</code>, <code>Career</code>, and <code>Class</code>.
							If there are any choices to be made, you'll be prompted to make your selections.
						</li>
						<li>
							Optionally, you can choose a <code>Complication</code> - but you can skip this if you'd prefer.
						</li>
						<li>
							Finally, go to the <code>Details</code> tab and give your hero a name.
						</li>
					</ul>
					<div className='ds-text'>
						When you're done, click <code>Save Changes</code> in the toolbar at the top, and you'll see your hero sheet.
					</div>
					<HeaderText>Sourcebooks</HeaderText>
					<div className='ds-text'>
						Sourcebooks contain ancestries, classes, kits, and so on.
						If you have a homebrew sourcebook you'd like to use for this hero, you can include it here.
					</div>
					<Select
						style={{ width: '100%' }}
						placeholder='Select'
						mode='multiple'
						options={props.sourcebooks.map(cs => ({ value: cs.id, label: cs.name || 'Unnamed Sourcebook' }))}
						optionRender={option => <div className='ds-text'>{option.data.label}</div>}
						popupRender={menu => (
							<>
								{menu}
								<Divider style={{ margin: '8px 0' }} />
								<Upload
									style={{ width: '100%' }}
									accept='.drawsteel-sourcebook,.ds-sourcebook'
									showUploadList={false}
									beforeUpload={file => {
										file
											.text()
											.then(json => {
												const sourcebook = (JSON.parse(json) as Sourcebook);
												sourcebook.id = Utils.guid();
												SourcebookLogic.updateSourcebook(sourcebook);
												props.importSourcebook(sourcebook);
											});
										return false;
									}}
								>
									<Button block={true} icon={<DownloadOutlined />}>Import a sourcebook</Button>
								</Upload>
							</>
						)}
						showSearch={true}
						filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
						value={props.hero.settingIDs}
						onChange={props.setSettingIDs}
					/>
				</div>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface AncestrySectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	options: Options;
	searchTerm: string;
	selectAncestry: (ancestry: Ancestry) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const AncestrySection = (props: AncestrySectionProps) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');

	try {
		const ancestries = SourcebookLogic.getAncestries(props.sourcebooks).filter(a => matchElement(a, props.searchTerm));
		const options = ancestries.map(a => (
			<SelectablePanel key={a.id} onSelect={() => props.selectAncestry(a)}>
				<AncestryPanel ancestry={a} options={props.options} />
			</SelectablePanel>
		));

		let choices: ReactNode[] = [];
		if (props.hero.ancestry) {
			choices = FeatureLogic.getFeaturesFromAncestry(props.hero.ancestry, props.hero)
				.map(f => f.feature)
				.filter(f => FeatureLogic.isChoice(f))
				.map(f => (
					<SelectablePanel key={f.id}>
						<FeaturePanel feature={f} options={props.options} mode={PanelMode.Full} hero={props.hero} sourcebooks={props.sourcebooks} setData={props.setFeatureData} />
					</SelectablePanel>
				));
		}

		let columnClassName = 'hero-edit-content-column selected';
		if (choices.length === 0) {
			columnClassName += ' single-column';
		}

		return (
			<div className='hero-edit-content'>
				{
					props.hero.ancestry && (!isSmall || (choices.length === 0)) ?
						<div className={columnClassName} id='ancestry-selected'>
							<SelectablePanel showShadow={false}>
								<AncestryPanel ancestry={props.hero.ancestry} options={props.options} mode={PanelMode.Full} />
							</SelectablePanel>
						</div>
						: null
				}
				{
					!props.hero.ancestry && (options.length > 0) ?
						<div className='hero-edit-content-column grid' id='ancestry-list'>
							{options}
						</div>
						: null
				}
				{
					!props.hero.ancestry && (options.length === 0) ?
						<div className='hero-edit-content-column' id='ancestry-list'>
							<EmptyMessage hero={props.hero} />
						</div>
						: null
				}
				{
					choices.length > 0 ?
						<div className='hero-edit-content-column choices' id='ancestry-choices'>
							<HeaderText>Choices</HeaderText>
							{choices}
						</div>
						: null
				}
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface CultureSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	options: Options;
	searchTerm: string;
	selectCulture: (culture: Culture) => void;
	selectLanguages: (languages: string[]) => void;
	selectEnvironment: (id: string | null) => void;
	selectOrganization: (id: string | null) => void;
	selectUpbringing: (id: string | null) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const CultureSection = (props: CultureSectionProps) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');

	try {
		const cultures = [ CultureData.bespoke, ...SourcebookLogic.getCultures(props.sourcebooks) ].filter(c => matchElement(c, props.searchTerm));
		const options = cultures.map(c => (
			<SelectablePanel key={c.id} onSelect={() => props.selectCulture(c)}>
				<CulturePanel culture={c} options={props.options} />
			</SelectablePanel>
		));

		let choices: ReactNode[] = [];
		if (props.hero.culture) {
			choices = FeatureLogic.getFeaturesFromCulture(props.hero.culture, props.hero)
				.map(f => f.feature)
				.filter(f => FeatureLogic.isChoice(f))
				.map(f => (
					<SelectablePanel key={f.id}>
						<FeaturePanel feature={f} options={props.options} mode={PanelMode.Full} hero={props.hero} sourcebooks={props.sourcebooks} setData={props.setFeatureData} />
					</SelectablePanel>
				));

			if (props.hero.culture.id === CultureData.bespoke.id) {
				choices.unshift(
					<SelectablePanel key='bespoke'>
						<HeaderText>Bespoke Culture</HeaderText>
						<div className='ds-text'>Choose your Environment, Organization, and Upbringing.</div>
						<Space direction='vertical' style={{ width: '100%' }}>
							<Select
								style={{ width: '100%' }}
								status={props.hero.culture.environment === null ? 'warning' : ''}
								allowClear={true}
								placeholder='Environment'
								options={EnvironmentData.getEnvironments().map(s => ({ value: s.id, label: s.name, desc: s.description }))}
								optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
								showSearch={true}
								filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
								value={props.hero.culture.environment ? props.hero.culture.environment.id : null}
								onChange={props.selectEnvironment}
							/>
							<Select
								style={{ width: '100%' }}
								status={props.hero.culture.organization === null ? 'warning' : ''}
								allowClear={true}
								placeholder='Organization'
								options={OrganizationData.getOrganizations().map(s => ({ value: s.id, label: s.name, desc: s.description }))}
								optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
								showSearch={true}
								filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
								value={props.hero.culture.organization ? props.hero.culture.organization.id : null}
								onChange={props.selectOrganization}
							/>
							<Select
								style={{ width: '100%' }}
								status={props.hero.culture.upbringing === null ? 'warning' : ''}
								allowClear={true}
								placeholder='Upbringing'
								options={UpbringingData.getUpbringings().map(s => ({ value: s.id, label: s.name, desc: s.description }))}
								optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
								showSearch={true}
								filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
								value={props.hero.culture.upbringing ? props.hero.culture.upbringing.id : null}
								onChange={props.selectUpbringing}
							/>
						</Space>
					</SelectablePanel>
				);
			}

			const languages = SourcebookLogic.getLanguages(props.sourcebooks as Sourcebook[]);
			const distinctLanguages = Collections.distinct(languages, l => l.name);
			const sortedLanguages = Collections.sort(distinctLanguages, l => l.name);

			choices.unshift(
				<SelectablePanel key='language'>
					<HeaderText>Language</HeaderText>
					<div className='ds-text'>Choose your language.</div>
					<Select
						style={{ width: '100%' }}
						status={props.hero.culture.languages.length === 0 ? 'warning' : ''}
						allowClear={true}
						placeholder='Select'
						options={
							[ LanguageType.Common, LanguageType.Regional, LanguageType.Cultural, LanguageType.Dead ]
								.filter(type => sortedLanguages.some(l => l.type === type))
								.map(type => ({
									label: <HeaderText>{type} Languages</HeaderText>,
									value: type,
									desc: type,
									options: sortedLanguages
										.filter(l => l.type === type)
										.map(l => ({
											label: <Field label={l.name} value={l.description} />,
											value: l.name,
											desc: l.description
										}))
								}))
						}
						labelRender={x => x.value}
						showSearch={true}
						filterOption={(input, option) => {
							const strings = option ?
								[
									option.value,
									option.desc
								]
								: [];
							return strings.some(str => str.toLowerCase().includes(input.toLowerCase()));
						}}
						value={props.hero.culture.languages.length > 0 ? props.hero.culture.languages[0] : null}
						onChange={value => props.selectLanguages(value ? [ value ] : [])}
					/>
				</SelectablePanel>
			);
		}

		let columnClassName = 'hero-edit-content-column selected';
		if (choices.length === 0) {
			columnClassName += ' single-column';
		}

		return (
			<div className='hero-edit-content'>
				{
					props.hero.culture && (!isSmall || (choices.length === 0)) ?
						<div className={columnClassName} id='culture-selected'>
							<SelectablePanel showShadow={false}>
								<CulturePanel culture={props.hero.culture} options={props.options} mode={PanelMode.Full} />
							</SelectablePanel>
						</div>
						: null
				}
				{
					!props.hero.culture && (options.length > 0) ?
						<div className='hero-edit-content-column grid' id='culture-list'>
							{options}
						</div>
						: null
				}
				{
					!props.hero.culture && (options.length === 0) ?
						<div className='hero-edit-content-column' id='culture-list'>
							<EmptyMessage hero={props.hero} />
						</div>
						: null
				}
				{
					choices.length > 0 ?
						<div className='hero-edit-content-column choices' id='culture-choices'>
							<HeaderText>Choices</HeaderText>
							{choices}
						</div>
						: null
				}
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface CareerSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	options: Options;
	searchTerm: string;
	selectCareer: (career: Career) => void;
	selectIncitingIncident: (id: string | null) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const CareerSection = (props: CareerSectionProps) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');

	try {
		const careers = SourcebookLogic.getCareers(props.sourcebooks).filter(c => matchElement(c, props.searchTerm));
		const options = careers.map(c => (
			<SelectablePanel key={c.id} onSelect={() => props.selectCareer(c)}>
				<CareerPanel career={c} options={props.options} />
			</SelectablePanel>
		));

		let choices: ReactNode[] = [];
		if (props.hero.career) {
			choices = FeatureLogic.getFeaturesFromCareer(props.hero.career, props.hero)
				.map(f => f.feature)
				.filter(f => FeatureLogic.isChoice(f))
				.map(f => (
					<SelectablePanel key={f.id}>
						<FeaturePanel feature={f} options={props.options} mode={PanelMode.Full} hero={props.hero} sourcebooks={props.sourcebooks} setData={props.setFeatureData} />
					</SelectablePanel>
				));

			choices.push(
				<SelectablePanel key='inciting-incident'>
					<HeaderText>Inciting Incident</HeaderText>
					<div className='ds-text'>Choose an inciting incident.</div>
					<Select
						style={{ width: '100%' }}
						status={props.hero.career.incitingIncidents.selectedID === null ? 'warning' : ''}
						allowClear={true}
						placeholder='Select'
						options={props.hero.career.incitingIncidents.options.map(s => ({ value: s.id, label: s.name, desc: s.description }))}
						optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
						showSearch={true}
						filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
						value={props.hero.career.incitingIncidents.selectedID}
						onChange={props.selectIncitingIncident}
					/>
					{props.hero.career.incitingIncidents.options.filter(i => i.id === props.hero.career!.incitingIncidents.selectedID).map(i => <Field key={i.id} label={i.name} value={i.description} />)}
				</SelectablePanel>
			);
		}

		let columnClassName = 'hero-edit-content-column selected';
		if (choices.length === 0) {
			columnClassName += ' single-column';
		}

		return (
			<div className='hero-edit-content'>
				{
					props.hero.career && (!isSmall || (choices.length === 0)) ?
						<div className={columnClassName} id='career-selected'>
							<SelectablePanel showShadow={false}>
								<CareerPanel career={props.hero.career} options={props.options} mode={PanelMode.Full} />
							</SelectablePanel>
						</div>
						: null
				}
				{
					!props.hero.career && (options.length > 0) ?
						<div className='hero-edit-content-column grid' id='career-list'>
							{options}
						</div>
						: null
				}
				{
					!props.hero.career && (options.length === 0) ?
						<div className='hero-edit-content-column' id='career-list'>
							<EmptyMessage hero={props.hero} />
						</div>
						: null
				}
				{
					choices.length > 0 ?
						<div className='hero-edit-content-column choices' id='career-choices'>
							<HeaderText>Choices</HeaderText>
							{choices}
						</div>
						: null
				}
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface ClassSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	options: Options;
	searchTerm: string;
	selectClass: (heroClass: HeroClass) => void;
	setLevel: (level: number) => void;
	selectPrimaryCharacteristics: (characteristics: Characteristic[]) => void;
	selectCharacteristics: (array: { characteristic: Characteristic, value: number }[]) => void;
	selectSubclasses: (subclassIDs: string[]) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const ClassSection = (props: ClassSectionProps) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');

	const [ array, setArray ] = useState<number[] | null>(() => {
		let currentArray = null;

		if (props.hero.class && (props.hero.class.primaryCharacteristics.length > 0)) {
			const cls = props.hero.class;
			const str = props.hero.class.characteristics
				.filter(ch => !cls.primaryCharacteristics.includes(ch.characteristic))
				.map(ch => ch.value)
				.join(', ');
			currentArray = HeroLogic.getCharacteristicArrays(cls.primaryCharacteristics.length)
				.find(arr => Collections.getPermutations(arr).map(a => a.join(', ')).includes(str)) || null;
		}

		return currentArray;
	});
	const [ selectedSubClass, setSelectedSubClass ] = useState<SubClass | null>(null);

	try {
		const classes = SourcebookLogic.getClasses(props.sourcebooks).filter(c => matchElement(c, props.searchTerm));
		const options = classes.map(c => (
			<SelectablePanel key={c.id} onSelect={() => props.selectClass(c)}>
				<ClassPanel heroClass={c} options={props.options} />
			</SelectablePanel>
		));

		let choices: ReactNode[] = [];
		if (props.hero.class) {
			choices = FeatureLogic.getFeaturesFromClass(props.hero.class, props.hero)
				.map(f => f.feature)
				.filter(f => FeatureLogic.isChoice(f))
				.map(f => (
					<SelectablePanel key={f.id}>
						<FeaturePanel feature={f} options={props.options} mode={PanelMode.Full} hero={props.hero} sourcebooks={props.sourcebooks} setData={props.setFeatureData} />
					</SelectablePanel>
				));

			//#region Choose subclass

			if (props.hero.class.subclasses.length > 0) {
				choices.unshift(
					<SelectablePanel key='subclass'>
						<HeaderText>{props.hero.class.subclassName}</HeaderText>
						<div className='ds-text'>Choose {props.hero.class.subclassCount === 1 ? `a ${props.hero.class.subclassName || 'subclass'}` : `${props.hero.class.subclassCount} ${props.hero.class.subclassName || 'subclasse'}s`}.</div>
						<Select
							style={{ width: '100%' }}
							status={props.hero.class.subclasses.filter(sc => sc.selected).length === 0 ? 'warning' : ''}
							mode={props.hero.class.subclassCount === 1 ? undefined : 'multiple'}
							maxCount={props.hero.class.subclassCount === 1 ? undefined : props.hero.class.subclassCount}
							allowClear={true}
							placeholder='Select'
							options={props.hero.class.subclasses.map(s => ({ value: s.id, label: s.name, desc: s.description }))}
							optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
							showSearch={true}
							filterOption={(input, option) => { return (option?.label || '').toLowerCase().includes(input.toLowerCase()); }}
							value={props.hero.class.subclasses.filter(sc => sc.selected).map(sc => sc.id)}
							onChange={props.selectSubclasses}
						/>
						{
							props.hero.class.subclasses
								.filter(sc => sc.selected)
								.map(sc => (
									<Flex key={sc.id} align='center'>
										<Field
											style={{ flex: '1 1 0' }}
											label={sc.name}
											value={sc.description}
										/>
										<Button
											style={{ flex: '0 0 auto' }}
											type='text'
											title='Select'
											icon={<InfoCircleOutlined />}
											onClick={() => setSelectedSubClass(sc)}
										/>
									</Flex>
								))
						}
					</SelectablePanel>
				);
			}

			//#endregion

			//#region Choose characteristics

			if (props.hero.class.primaryCharacteristics.length > 0) {
				const arrays = HeroLogic.getCharacteristicArrays(props.hero.class.primaryCharacteristics.length);
				choices.unshift(
					<SelectablePanel key='characteristics'>
						<HeaderText>Characteristics</HeaderText>
						<Select
							style={{ width: '100%' }}
							status={array === null ? 'warning' : ''}
							placeholder='Select characteristic array'
							options={arrays.map(a => ({ value: a.join(', '), array: a }))}
							optionRender={option => <div className='ds-text'>{option.data.value}</div>}
							value={array ? array.join(', ') : null}
							onChange={(_text, option) => {
								const data = option as unknown as { value: string, array: number[] };
								setArray(data.array);
							}}
						/>
						{
							array ?
								<div>
									<div className='characteristic-row' style={{ margin: '5px 15px', fontWeight: 600 }}>
										<div className='characteristic-item characteristic-heading'>M</div>
										<div className='characteristic-item characteristic-heading'>A</div>
										<div className='characteristic-item characteristic-heading'>R</div>
										<div className='characteristic-item characteristic-heading'>I</div>
										<div className='characteristic-item characteristic-heading'>P</div>
									</div>
									<Radio.Group
										style={{ width: '100%' }}
										value={JSON.stringify(props.hero.class.characteristics)}
										onChange={e => {
											const array = JSON.parse(e.target.value) as { characteristic: Characteristic, value: number }[];
											props.selectCharacteristics(array);
										}}
									>
										<Space direction='vertical' style={{ width: '100%' }}>
											{
												HeroLogic.calculateCharacteristicArrays(array, props.hero.class.primaryCharacteristics).map((array, n1) => (
													<Radio.Button key={n1} value={JSON.stringify(array)} style={{ width: '100%' }}>
														<div className='characteristic-row'>
															{array.map((ch, n2) => <div key={n2} className='characteristic-item'>{ch.value}</div>)}
														</div>
													</Radio.Button>
												))
											}
										</Space>
									</Radio.Group>
								</div>
								: null
						}
					</SelectablePanel>
				);
			}

			//#endregion

			//#region Choose primary characteristics

			if (props.hero.class.primaryCharacteristicsOptions.length > 1) {
				choices.unshift(
					<SelectablePanel key='primary-characteristics'>
						<HeaderText>Primary Characteristics</HeaderText>
						<Select
							style={{ width: '100%' }}
							status={array === null ? 'warning' : ''}
							placeholder='Select your primary characteristics'
							options={props.hero.class.primaryCharacteristicsOptions.map(a => ({ value: a.join(', '), array: a }))}
							optionRender={option => <div className='ds-text'>{option.data.value}</div>}
							value={props.hero.class.primaryCharacteristics && (props.hero.class.primaryCharacteristics.length > 0) ? props.hero.class.primaryCharacteristics.join(', ') : null}
							onChange={(_text, option) => {
								const data = option as unknown as { value: string, array: Characteristic[] };
								props.selectPrimaryCharacteristics(data.array);
							}}
						/>
					</SelectablePanel>
				);
			}

			//#endregion

			//#region Set level

			choices.unshift(
				<SelectablePanel key='class-level'>
					<HeaderText>Level</HeaderText>
					<NumberSpin
						value={props.hero.class.level}
						min={1}
						max={props.hero.class.featuresByLevel.length}
						onChange={value => props.setLevel(value)}
					/>
					<Field label='XP' value={props.hero.state.xp} />
				</SelectablePanel>
			);

			//#endregion
		}

		let columnClassName = 'hero-edit-content-column selected';
		if (choices.length === 0) {
			columnClassName += ' single-column';
		}

		return (
			<div className='hero-edit-content'>
				{
					props.hero.class && (!isSmall || (choices.length === 0)) ?
						<div className={columnClassName} id='class-selected'>
							<SelectablePanel showShadow={false}>
								<ClassPanel heroClass={props.hero.class} hero={props.hero} options={props.options} mode={PanelMode.Full} />
							</SelectablePanel>
						</div>
						: null
				}
				{
					!props.hero.class && (options.length > 0) ?
						<div className='hero-edit-content-column grid' id='class-list'>
							{options}
						</div>
						: null
				}
				{
					!props.hero.class && (options.length === 0) ?
						<div className='hero-edit-content-column' id='class-list'>
							<EmptyMessage hero={props.hero} />
						</div>
						: null
				}
				{
					choices.length > 0 ?
						<div className='hero-edit-content-column choices' id='class-choices'>
							<HeaderText>Choices</HeaderText>
							{choices}
						</div>
						: null
				}
				<Drawer open={!!selectedSubClass} onClose={() => setSelectedSubClass(null)} closeIcon={null} width='500px'>
					<Modal
						content={selectedSubClass ? <SubclassPanel subclass={selectedSubClass} options={props.options} mode={PanelMode.Full} /> : null}
						onClose={() => setSelectedSubClass(null)}
					/>
				</Drawer>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface ComplicationSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	options: Options;
	searchTerm: string;
	selectComplication: (complication: Complication) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const ComplicationSection = (props: ComplicationSectionProps) => {
	const isSmall = useMediaQuery('(max-width: 1000px)');

	try {
		const complications = SourcebookLogic.getComplications(props.sourcebooks).filter(c => matchElement(c, props.searchTerm));
		const options = complications.map(c => (
			<SelectablePanel key={c.id} onSelect={() => props.selectComplication(c)}>
				<ComplicationPanel complication={c} options={props.options} />
			</SelectablePanel>
		));

		let choices: ReactNode[] = [];
		if (props.hero.complication) {
			choices = FeatureLogic.getFeaturesFromComplication(props.hero.complication, props.hero)
				.map(f => f.feature)
				.filter(f => FeatureLogic.isChoice(f))
				.map(f => (
					<SelectablePanel key={f.id}>
						<FeaturePanel feature={f} options={props.options} mode={PanelMode.Full} hero={props.hero} sourcebooks={props.sourcebooks} setData={props.setFeatureData} />
					</SelectablePanel>
				));
		}

		let columnClassName = 'hero-edit-content-column selected';
		if (choices.length === 0) {
			columnClassName += ' single-column';
		}

		return (
			<div className='hero-edit-content'>
				{
					props.hero.complication && (!isSmall || (choices.length === 0)) ?
						<div className={columnClassName} id='complication-selected'>
							<SelectablePanel showShadow={false}>
								<ComplicationPanel complication={props.hero.complication} options={props.options} mode={PanelMode.Full} />
							</SelectablePanel>
						</div>
						: null
				}
				{
					!props.hero.complication && (options.length > 0) ?
						<div className='hero-edit-content-column grid' id='complication-list'>
							{options}
						</div>
						: null
				}
				{
					!props.hero.complication && (options.length === 0) ?
						<div className='hero-edit-content-column' id='complication-list'>
							<EmptyMessage hero={props.hero} />
						</div>
						: null
				}
				{
					choices.length > 0 ?
						<div className='hero-edit-content-column choices' id='complication-choices'>
							<HeaderText>Choices</HeaderText>
							{choices}
						</div>
						: null
				}
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface DetailsSectionProps {
	hero: Hero;
	allHeroes: Hero[];
	sourcebooks: Sourcebook[];
	options: Options;
	setName: (value: string) => void;
	setFolder: (value: string) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

const DetailsSection = (props: DetailsSectionProps) => {
	const folders = props.allHeroes
		.map(h => h.folder)
		.filter(f => !!f)
		.sort();

	try {
		return (
			<div className='hero-edit-content'>
				<div className='hero-edit-content-column single-column choices' id='details-main'>
					<HeaderText>Name</HeaderText>
					<Input
						status={props.hero.name === '' ? 'warning' : ''}
						placeholder='Name'
						allowClear={true}
						addonAfter={<ThunderboltOutlined className='random-btn' onClick={() => props.setName(NameGenerator.generateName())} />}
						value={props.hero.name}
						onChange={e => props.setName(e.target.value)}
					/>
					<HeaderText>Folder</HeaderText>
					<AutoComplete
						value={props.hero.folder}
						options={Collections.distinct(folders, f => f).map(option => ({ value: option, label: <div className='ds-text'>{option}</div> }))}
						placeholder='Folder'
						onSelect={value => props.setFolder(value)}
						onChange={value => props.setFolder(value)}
						showSearch={true}
						filterOption={(value, option) => value.toLowerCase().split(' ').every(token => option!.value.toLowerCase().indexOf(token.toLowerCase()) !== -1)}
					/>
					<Alert
						type='info'
						showIcon={true}
						message='You can add your hero to a folder to group it with other heroes.'
					/>
					{
						props.hero.features.filter(f => f.id === 'default-language').map(f => (
							<FeaturePanel
								key={f.id}
								feature={f}
								options={props.options}
								hero={props.hero}
								sourcebooks={props.sourcebooks}
								mode={PanelMode.Full}
								setData={props.setFeatureData}
							/>
						))
					}
				</div>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface EmptyMessageProps {
	hero: Hero;
}

const EmptyMessage = (props: EmptyMessageProps) => {
	const navigation = useNavigation();

	try {
		return (
			<Alert
				type='info'
				showIcon={true}
				message={
					<div>
						Looking for something specific? If it's homebrew, make sure you've included the sourcebook it's in.
						<Divider type='vertical' />
						<Button type='primary' onClick={() => navigation.goToHeroEdit(props.hero.id, 'start')}>
							Click Here
						</Button>
					</div>
				}
			/>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
