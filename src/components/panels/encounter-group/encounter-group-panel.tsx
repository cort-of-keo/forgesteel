import { Alert, Button, Flex, Popover, Segmented, Tag } from 'antd';
import { EllipsisOutlined, HeartFilled } from '@ant-design/icons';
import { Encounter, EncounterGroup, EncounterSlot } from '../../../models/encounter';
import { HeroInfo, MonsterInfo, TerrainInfo } from '../../controls/token/token';
import { Collections } from '../../../utils/collections';
import { ConditionLogic } from '../../../logic/condition-logic';
import { DangerButton } from '../../controls/danger-button/danger-button';
import { Format } from '../../../utils/format';
import { Hero } from '../../../models/hero';
import { HeroLogic } from '../../../logic/hero-logic';
import { Monster } from '../../../models/monster';
import { MonsterLogic } from '../../../logic/monster-logic';
import { MonsterOrganizationType } from '../../../enums/monster-organization-type';
import { Terrain } from '../../../models/terrain';
import { TerrainLogic } from '../../../logic/terrain-logic';

import './encounter-group-panel.scss';

interface EncounterGroupHeroProps {
	hero: Hero;
	onSelect: (hero: Hero) => void;
	onSelectMonster: (monster: Monster) => void;
	onSetState?: (hero: Hero, state: 'ready' | 'current' | 'finished') => void;
	onDelete?: (hero: Hero) => void;
}

export const EncounterGroupHero = (props: EncounterGroupHeroProps) => {
	try {
		let className = 'encounter-group';
		if (props.hero.state.defeated) {
			className += ' defeated';
		} else if (props.hero.state.encounterState === 'finished') {
			className += ' acted';
		}

		const getStaminaDescription = () => {
			const max = HeroLogic.getStamina(props.hero);

			let str = `${max}`;
			if (props.hero.state.staminaDamage > 0) {
				str = `${Math.max(max - props.hero.state.staminaDamage, 0)} / ${max}`;
			}
			if (props.hero.state.staminaTemp > 0) {
				str += ` +${props.hero.state.staminaTemp}`;
			}

			return str;
		};

		return (
			<div className={className}>
				<div className='group-column'>
					<Flex align='center' justify='space-between'>
						<div className='group-name'>
							Hero
						</div>
						{
							props.onSetState && props.onDelete ?
								<Popover
									trigger='click'
									content={(
										<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
											<Segmented
												vertical={true}
												disabled={props.hero.state.defeated}
												options={[
													{ value: 'ready', label: 'Ready To Act' },
													{ value: 'current', label: 'Acting Now' },
													{ value: 'finished', label: 'Finished' }
												]}
												value={props.hero.state.encounterState}
												onChange={value => props.onSetState!(props.hero, value as 'ready' | 'current' | 'finished')}
											/>
											<DangerButton mode='block' onConfirm={() => props.onDelete!(props.hero)} />
										</div>
									)}
								>
									<Button type='text' icon={<EllipsisOutlined />} />
								</Popover>
								: null
						}
					</Flex>
				</div>
				<div className='encounter-slots'>
					<div className='encounter-slot'>
						<div className={props.hero.state.defeated ? 'encounter-slot-row defeated' : 'encounter-slot-row'} onClick={() => props.onSelect(props.hero)}>
							<div className='name-column'>
								<HeroInfo hero={props.hero} />
							</div>
							{
								HeroLogic.getStamina(props.hero) === 0 ?
									<div className='stamina-column' />
									:
									<div className='stamina-column'>
										{getStaminaDescription()}
										<HeartFilled style={{ color: 'rgb(200, 0, 0)' }} />
									</div>
							}
							<div className='conditions-column'>
								{[ 'healthy', 'injured' ].includes(HeroLogic.getCombatState(props.hero)) ? null : <Tag>{Format.capitalize(HeroLogic.getCombatState(props.hero))}</Tag>}
								{props.hero.state.hidden ? <Tag>Hidden</Tag> : null}
								{props.hero.state.conditions.map(c => <Tag key={c.id}>{ConditionLogic.getFullDescription(c)}</Tag>)}
							</div>
						</div>
					</div>
					{
						HeroLogic.getCompanions(props.hero).map(m => (
							<div key={m.id} className='encounter-slot'>
								<div className='encounter-slot-row' onClick={() => props.onSelectMonster(m)}>
									<div className='name-column'>
										<MonsterInfo monster={m} />
									</div>
									<div className='stamina-column'>
										{MonsterLogic.getStaminaDescription(m)}
										<HeartFilled style={{ color: 'rgb(200, 0, 0)' }} />
									</div>
									<div className='conditions-column'>
										{[ 'healthy', 'injured' ].includes(HeroLogic.getCombatState(props.hero)) ? null : <Tag>{Format.capitalize(MonsterLogic.getCombatState(m))}</Tag>}
										{m.state.hidden ? <Tag>Hidden</Tag> : null}
										{m.state.conditions.map(c => <Tag key={c.id}>{ConditionLogic.getFullDescription(c)}</Tag>)}
									</div>
								</div>
							</div>
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

interface EncounterGroupMonsterProps {
	group: EncounterGroup;
	index: number;
	encounter: Encounter;
	onSelectMonster: (monster: Monster) => void;
	onSelectMinionSlot?: (slot: EncounterSlot) => void;
	onSetState?: (group: EncounterGroup, state: 'ready' | 'current' | 'finished') => void;
	onDuplicate?: (group: EncounterGroup) => void;
	onDelete?: (group: EncounterGroup) => void;
}

export const EncounterGroupMonster = (props: EncounterGroupMonsterProps) => {
	try {
		const getSlot = (slot: EncounterSlot) => {
			const isMinionSlot = slot.monsters.every(m => m.role.organization === MonsterOrganizationType.Minion);

			const getStaminaDescription = () => {
				const max = Collections.sum(slot.monsters, m => MonsterLogic.getStamina(m));

				let str = `${max}`;
				if (slot.state.staminaDamage > 0) {
					str = `${Math.max(max - slot.state.staminaDamage, 0)} / ${max}`;
				}
				if (slot.state.staminaTemp > 0) {
					str += ` +${slot.state.staminaTemp}`;
				}

				return str;
			};

			const getMinionCountMessage = () => {
				if (!isMinionSlot) {
					return null;
				}

				const staminaRemaining = Collections.sum(slot.monsters, m => MonsterLogic.getStamina(m)) - slot.state.staminaDamage;
				const staminaPerMinion = Collections.mean(slot.monsters, m => MonsterLogic.getStamina(m));
				const minionsExpected = Math.max(Math.ceil(staminaRemaining / staminaPerMinion), 0);
				const minionsAlive = slot.monsters.filter(m => !m.state.defeated).length;

				if (minionsAlive !== minionsExpected) {
					return (
						<Alert
							type='warning'
							showIcon={true}
							message={`There should be ${minionsExpected} active minions, not ${minionsAlive}.`}
						/>
					);
				}

				return null;
			};

			const getMinionCaptainTag = () => {
				if (!isMinionSlot) {
					return null;
				}

				if (slot.state.captainID) {
					const captain = props.encounter.groups
						.flatMap(g => g.slots)
						.flatMap(s => s.monsters)
						.find(m => m.id === slot.state.captainID);
					if (captain) {
						return (
							<Tag>
								Captain: {captain.name}
							</Tag>
						);
					}
				}

				return (
					<Tag>No captain</Tag>
				);
			};

			return (
				<div key={slot.id} className='encounter-slot'>
					{
						isMinionSlot ?
							<div key='minions' className={slot.state.defeated ? 'encounter-slot-row minion defeated' : 'encounter-slot-row minion'} onClick={() => props.onSelectMinionSlot!(slot)}>
								<div className='name-column'>
									<b>Minions</b>
								</div>
								<div className='stamina-column'>
									{getStaminaDescription()}
									<HeartFilled style={{ color: 'rgb(200, 0, 0)' }} />
								</div>
								<div className='conditions-column'>
									{getMinionCaptainTag()}
									{slot.state.conditions.map(c => <Tag key={c.id}>{ConditionLogic.getFullDescription(c)}</Tag>)}
								</div>
							</div>
							: null
					}
					{
						isMinionSlot ? getMinionCountMessage() : null
					}
					{
						slot.monsters.map(monster => (
							<div key={monster.id} className={slot.state.defeated || monster.state.defeated ? 'encounter-slot-row defeated' : 'encounter-slot-row'} onClick={() => props.onSelectMonster!(monster)}>
								<div className='name-column'>
									<MonsterInfo monster={monster} />
								</div>
								{
									isMinionSlot ?
										<div className='stamina-column' />
										:
										<div className='stamina-column'>
											{MonsterLogic.getStaminaDescription(monster)}
											<HeartFilled style={{ color: 'rgb(200, 0, 0)' }} />
										</div>
								}
								<div className='conditions-column'>
									{[ 'healthy', 'injured' ].includes(MonsterLogic.getCombatState(monster)) ? null : <Tag>{Format.capitalize(MonsterLogic.getCombatState(monster))}</Tag>}
									{monster.state.hidden ? <Tag>Hidden</Tag> : null}
									{monster.state.conditions.map(c => <Tag key={c.id}>{ConditionLogic.getFullDescription(c)}</Tag>)}
								</div>
							</div>
						))
					}
				</div>
			);
		};

		const defeated = props.group.slots.every(s => s.state.defeated || s.monsters.every(m => m.state.defeated));
		let className = 'encounter-group';
		if (defeated) {
			className += ' defeated';
		} else if (props.group.encounterState === 'finished') {
			className += ' acted';
		}

		return (
			<div className={className}>
				<div className='group-column'>
					<Flex align='center' justify='space-between'>
						<div className='group-name'>
							Group {(props.index + 1).toString()}
						</div>
						{
							props.onSetState && props.onDuplicate && props.onDelete ?
								<Popover
									trigger='click'
									content={(
										<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
											<Segmented
												vertical={true}
												disabled={defeated}
												options={[
													{ value: 'ready', label: 'Ready To Act' },
													{ value: 'current', label: 'Acting Now' },
													{ value: 'finished', label: 'Finished' }
												]}
												value={props.group.encounterState}
												onChange={value => props.onSetState!(props.group, value as 'ready' | 'current' | 'finished')}
											/>
											<Button block={true} onClick={() => props.onDuplicate!(props.group)}>Duplicate</Button>
											<DangerButton mode='block' onConfirm={() => props.onDelete!(props.group)} />
										</div>
									)}
								>
									<Button type='text' icon={<EllipsisOutlined />} />
								</Popover>
								: null
						}
					</Flex>
				</div>
				<div className='encounter-slots'>
					{props.group.slots.map(getSlot)}
				</div>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};

interface EncounterGroupTerrainProps {
	terrain: Terrain;
	onSelect: (terrain: Terrain) => void;
	onDuplicate?: (terrain: Terrain) => void;
	onDelete?: (terrain: Terrain) => void;
}

export const EncounterGroupTerrain = (props: EncounterGroupTerrainProps) => {
	try {
		return (
			<div className='encounter-group'>
				<div className='group-column'>
					<Flex align='center' justify='space-between'>
						<div className='group-name'>
							Terrain
						</div>
						{
							props.onDuplicate && props.onDelete ?
								<Popover
									trigger='click'
									content={(
										<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
											<Button block={true} onClick={() => props.onDuplicate!(props.terrain)}>Duplicate</Button>
											<DangerButton onConfirm={() => props.onDelete!(props.terrain)} />
										</div>
									)}
								>
									<Button type='text' icon={<EllipsisOutlined />} />
								</Popover>
								: null
						}
					</Flex>
				</div>
				<div className='encounter-slots'>
					<div className='encounter-slot'>
						<div className='encounter-slot-row' onClick={() => props.onSelect(props.terrain)}>
							<div className='name-column'>
								<TerrainInfo terrain={props.terrain} />
							</div>
							<div className='stamina-column'>
								{TerrainLogic.getStaminaValue(props.terrain)}
								<HeartFilled style={{ color: 'rgb(200, 0, 0)' }} />
							</div>
							<div className='conditions-column'>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
