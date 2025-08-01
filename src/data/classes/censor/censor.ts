import { AbilityDistanceType } from '../../../enums/abiity-distance-type';
import { AbilityKeyword } from '../../../enums/ability-keyword';
import { Characteristic } from '../../../enums/characteristic';
import { FactoryLogic } from '../../../logic/factory-logic';
import { FeatureField } from '../../../enums/feature-field';
import { HeroClass } from '../../../models/class';
import { PerkList } from '../../../enums/perk-list';
import { SkillList } from '../../../enums/skill-list';
import { exorcist } from './exorcist';
import { oracle } from './oracle';
import { paragon } from './paragon';

export const censor: HeroClass = {
	id: 'class-censor',
	name: 'Censor',
	description: `
Demons and devils fear you. Criminals run from the sight of your shadow in the alley. Agents of chaos, blasphemers, and heretics tremble at the sound of your voice. You carry the power of the gods, armed with Wraths and sent out into the world first to seek, then censor those whose actions - or even existence - are anathema to your church.

You’re at your best against the strongest foes. Your judgments terrify heretics, stop enemies in their tracks, even hurl them across the battlefield.`,
	subclassName: 'Order',
	subclassCount: 1,
	primaryCharacteristicsOptions: [
		[ Characteristic.Might, Characteristic.Presence ]
	],
	primaryCharacteristics: [],
	featuresByLevel: [
		{
			level: 1,
			features: [
				FactoryLogic.feature.createBonus({
					id: 'censor-stamina',
					field: FeatureField.Stamina,
					value: 21,
					valuePerLevel: 12
				}),
				FactoryLogic.feature.createBonus({
					id: 'censor-recoveries',
					field: FeatureField.Recoveries,
					value: 12
				}),
				FactoryLogic.feature.createHeroicResource({
					id: 'censor-resource',
					name: 'Wrath',
					gains: [
						{
							trigger: 'Start of your turn',
							value: '2'
						},
						{
							trigger: 'The first time each round that a creature judged by you deals damage to you',
							value: '1'
						},
						{
							trigger: 'The first time each round that you deal damage to a creature judged by you',
							value: '1'
						}
					]
				}),
				FactoryLogic.feature.createSkillChoice({
					id: 'censor-1-1',
					listOptions: [ SkillList.Interpersonal, SkillList.Lore ],
					count: 2
				}),
				FactoryLogic.feature.createDomainChoice({
					id: 'censor-1-2'
				}),
				FactoryLogic.feature.createAbility({
					ability: FactoryLogic.createAbility({
						id: 'censor-1-4',
						name: 'Judgment',
						description: 'You utter a prayer that outlines your foe in holy energy.',
						type: FactoryLogic.type.createManeuver(),
						keywords: [ AbilityKeyword.Magic, AbilityKeyword.Ranged ],
						distance: [ FactoryLogic.distance.createRanged(10) ],
						target: '1 enemy',
						sections: [
							FactoryLogic.createAbilitySectionText(`The target is judged by you until the end of the encounter, you die, you use this ability again, or you willingly end this effect (no action required). If another censor judges the target, then your judgment on the target ends.

If a judged creature uses an action and you have line of effect to them, you can use a free triggered action to deal holy damage equal to twice your Presence score to them.

When the judged creature is reduced to 0 Stamina, you can use a free triggered action to use this ability against a new target within distance.

In addition, you can spend 1 wrath to take one of the following free triggered actions. You can’t use more than one instance of a benefit per trigger:

* When an adjacent judged target shifts, you can make a melee free strike against them. The target doesn't shift and their speed becomes 0 until the end of this turn.
* When a judged target makes a power roll, you can add a bane to the roll.
* When a judged target within distance uses an ability with a potency against another creature, you reduce the potency of the ability by 1 for that creature (to a minimum of 0).`),
							FactoryLogic.createAbilitySectionPackage('censor-judgment')
						]
					})
				}),
				FactoryLogic.feature.createKitChoice({
					id: 'censor-1-5'
				}),
				FactoryLogic.feature.createAbility({
					ability: FactoryLogic.createAbility({
						id: 'censor-1-6',
						name: 'My Life for Yours',
						description: 'The first principle of the oath: defend the righteous.',
						type: FactoryLogic.type.createTrigger('The target starts their turn or takes damage.'),
						keywords: [ AbilityKeyword.Magic, AbilityKeyword.Ranged ],
						distance: [ FactoryLogic.distance.createRanged(10) ],
						target: 'Self or one ally',
						sections: [
							FactoryLogic.createAbilitySectionText('You spend a Recovery and the target regains Stamina equal to your Recovery value.'),
							FactoryLogic.createAbilitySectionField({
								name: 'Spend',
								value: 1,
								effect: 'You can end one effect on the target that is ended by a saving throw or that ends at the end of their turn, or a prone target can stand up.'
							})
						]
					})
				}),
				FactoryLogic.feature.createDomainFeature({
					id: 'censor-1-7',
					level: 1
				}),
				FactoryLogic.feature.createClassAbilityChoice({
					id: 'censor-1-8',
					cost: 'signature'
				}),
				FactoryLogic.feature.createClassAbilityChoice({
					id: 'censor-1-9',
					cost: 3
				}),
				FactoryLogic.feature.createClassAbilityChoice({
					id: 'censor-1-10',
					cost: 5
				})
			]
		},
		{
			level: 2,
			features: [
				FactoryLogic.feature.createPerk({
					id: 'censor-2-1',
					lists: [ PerkList.Interpersonal, PerkList.Lore, PerkList.Supernatural ]
				})
			]
		},
		{
			level: 3,
			features: [
				FactoryLogic.feature.create({
					id: 'censor-3-1',
					name: 'Look on My Work and Despair',
					description: 'Your judgment has grown in divine power, manifesting your deity’s ire against blasphemers, causing them to fear your actions, especially when their allies are smited. Whenever you judge a creature you can spend 1 wrath to channel your divine power to make them afraid. If the target has P < [average], they are frightened of you (save ends). Whenever a creature judged by you to is reduced to 0 Stamina and you judge a new target as a free triggered action, if that new target has P < [strong], they are frightened of you (save ends). If the target is already frightened of you, they take damage equal to twice your Presence score instead.'
				}),
				FactoryLogic.feature.createClassAbilityChoice({
					id: 'censor-3-2',
					cost: 7
				})
			]
		}
	],
	abilities: [
		FactoryLogic.createAbility({
			id: 'censor-ability-1',
			name: 'Back, Blasphemer!',
			description: 'You channel power through your weapon to repel foes.',
			type: FactoryLogic.type.createMain(),
			cost: 'signature',
			keywords: [ AbilityKeyword.Area, AbilityKeyword.Magic, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.create({ type: AbilityDistanceType.Cube, value: 2, within: 1 }) ],
			target: 'Each enemy in the area',
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Presence ],
						tier1: '2 holy damage; push 1',
						tier2: '4 holy damage; push 2',
						tier3: '6 holy damage; push 3'
					})
				)
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-2',
			name: 'Every Step ... Death!',
			description: 'You show your foe a glimpse of their fate after death.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Magic, AbilityKeyword.Ranged, AbilityKeyword.Strike ],
			distance: [ FactoryLogic.distance.createRanged(10) ],
			target: '1 creature',
			cost: 'signature',
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Presence ],
						tier1: '5 + P psychic damage',
						tier2: '7 + P psychic damage',
						tier3: '10 + P psychic damage'
					})
				),
				FactoryLogic.createAbilitySectionText('Each time the target willingly moves before the end of your next turn, they take 1 psychic damage for each square they move.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-3',
			name: 'Halt, Miscreant!',
			description: '“Your race is run!”',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature or object',
			cost: 'signature',
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '2 + M holy damage; P < [weak], slowed (save ends)',
						tier2: '5 + M holy damage; P < [average], slowed (save ends)',
						tier3: '7 + M holy damage; P < [strong], slowed (save ends)'
					})
				)
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-4',
			name: 'Your Allies Cannot Save You!',
			description: '“See how they abandon you!”',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature or object',
			cost: 'signature',
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '3 + M holy damage',
						tier2: '5 + M holy damage',
						tier3: '8 + M holy damage'
					})
				),
				FactoryLogic.createAbilitySectionText('Each enemy adjacent to the target is pushed away from the target up to a number of squares equal to your Presence score.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-5',
			name: 'Behold, a Shield of Faith!',
			description: '“Allow me to intercede.”',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature or object',
			cost: 3,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '3 + M holy damage',
						tier2: '6 + M holy damage',
						tier3: '9 + M holy damage'
					})
				),
				FactoryLogic.createAbilitySectionText('Until the start of your next turn, enemies have a bane on ability power rolls made against you and each ally adjacent to you.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-6',
			name: 'Driving Assault',
			description: 'As you force your enemy back with your weapon, you use your faith to stay close.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature or object',
			cost: 3,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '3 + M damage; push 1',
						tier2: '6 + M damage; push 3',
						tier3: '9 + M damage; push 5'
					})
				),
				FactoryLogic.createAbilitySectionText('You can shift up to your speed and must end that shift within distance of the target.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-7',
			name: 'The Gods Punish and Defend',
			description: 'You channel holy energy to smite a foe and heal an ally.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature or object',
			cost: 3,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '5 + M holy damage',
						tier2: '8 + M holy damage',
						tier3: '11 + M holy damage'
					})
				),
				FactoryLogic.createAbilitySectionText('You can spend a Recovery to allow yourself or one ally within 10 squares of you to regain Stamina equal to your Recovery value.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-8',
			name: 'Repent!',
			description: 'You conjure memories of their sins.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Magic, AbilityKeyword.Ranged, AbilityKeyword.Strike ],
			distance: [ FactoryLogic.distance.createRanged(10) ],
			target: '1 creature',
			cost: 3,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Presence ],
						tier1: '5 + P holy damage; I < [weak], dazed (save ends)',
						tier2: '8 + P holy damage; I < [average], dazed (save ends)',
						tier3: '11 + P holy damage; I < [strong], dazed (save ends)'
					})
				)
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-9',
			name: 'Arrest',
			description: '“I got you, you son of a bitch.”',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Magic, AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature',
			cost: 5,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '6 + M holy damage; grabbed',
						tier2: '9 + M holy damage; grabbed',
						tier3: '13 + M holy damage; grabbed'
					})
				),
				FactoryLogic.createAbilitySectionText('If the target makes a strike against a creature while grabbed by you, you can then spend 3 wrath to deal holy damage to them equal to your Presence score and change the target of the strike to another target within the strike’s distance.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-10',
			name: 'Behold the Face of Evil!',
			description: 'You show your enemies a vision of the true nature of one of their companions.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Magic, AbilityKeyword.Melee, AbilityKeyword.Ranged, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [
				FactoryLogic.distance.createMelee(),
				FactoryLogic.distance.createRanged(5)
			],
			target: '1 creature',
			cost: 5,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '3 + M holy damage; if the target has P < [weak], each enemy within 2 squares of them is frightened of you (save ends)',
						tier2: '5 + M holy damage; if the target has P < [average], each enemy within 2 squares of them is frightened of you (save ends)',
						tier3: '8 + M holy damage; if the target has P < [strong], each enemy within 2 squares of them is frightened of you (save ends)'
					})
				),
				FactoryLogic.createAbilitySectionText('Each enemy frightened by this ability is pushed 2 squares away from the target and takes psychic damage equal to your Presence score.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-11',
			name: 'Censored',
			description: 'Judged and sentenced.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Melee, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [ FactoryLogic.distance.createMelee() ],
			target: '1 creature',
			cost: 5,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '2 + M holy damage',
						tier2: '3 + M holy damage',
						tier3: '5 + M holy damage'
					})
				),
				FactoryLogic.createAbilitySectionText('If a target who is not a leader or a solo creature is winded after the damage is resolved, they die.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-12',
			name: 'Purifying Fire',
			description: 'The gods judge, fire cleanses.',
			type: FactoryLogic.type.createMain(),
			keywords: [ AbilityKeyword.Magic, AbilityKeyword.Melee, AbilityKeyword.Ranged, AbilityKeyword.Strike, AbilityKeyword.Weapon ],
			distance: [
				FactoryLogic.distance.createMelee(),
				FactoryLogic.distance.createRanged(5)
			],
			target: '1 creature',
			cost: 5,
			sections: [
				FactoryLogic.createAbilitySectionRoll(
					FactoryLogic.createPowerRoll({
						characteristic: [ Characteristic.Might ],
						tier1: '5 + M holy damage; M < [weak], the target has fire weakness 3 (save ends)',
						tier2: '9 + M holy damage; M < [average], the target has fire weakness 5 (save ends)',
						tier3: '12 + M holy damage; M < [strong], the target has fire weakness 7 (save ends)'
					})
				),
				FactoryLogic.createAbilitySectionText('While the target has fire weakness from this ability, you can choose to have your abilities deal fire damage to the target instead of holy damage.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-13',
			name: 'Edict of Disruptive Isolation',
			description: 'Gather not together in secret to conspire.',
			type: FactoryLogic.type.createManeuver(),
			keywords: [ AbilityKeyword.Area, AbilityKeyword.Magic ],
			distance: [ FactoryLogic.distance.create({ type: AbilityDistanceType.Aura, value: 2 }) ],
			target: 'Each enemy in the area',
			cost: 7,
			sections: [
				FactoryLogic.createAbilitySectionText('Until the end of the encounter or you are dying, at the end of each of your turns, each target takes holy damage equal to your Presence score. Any target adjacent to one or more enemies takes an extra 2d6 holy damage if they are judged by you or adjacent to one of your enemies.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-14',
			name: 'Edict of Perfect Order',
			description: 'Use not the fell arts!',
			type: FactoryLogic.type.createManeuver(),
			keywords: [ AbilityKeyword.Area, AbilityKeyword.Magic ],
			distance: [ FactoryLogic.distance.create({ type: AbilityDistanceType.Aura, value: 2 }) ],
			target: 'Each enemy in the area',
			cost: 7,
			sections: [
				FactoryLogic.createAbilitySectionText('Until the end of the encounter or you are dying, whenever a target uses an ability that requires Malice, they take holy damage equal to three times your Presence score. A target judged by you takes an additional 2d6 holy damage.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-15',
			name: 'Edict of Purifying Pacifism',
			description: 'Shed not the blood of innocents!',
			type: FactoryLogic.type.createManeuver(),
			keywords: [ AbilityKeyword.Area, AbilityKeyword.Magic ],
			distance: [ FactoryLogic.distance.create({ type: AbilityDistanceType.Aura, value: 2 }) ],
			target: 'Each enemy in the area',
			cost: 7,
			sections: [
				FactoryLogic.createAbilitySectionText('Until the end of the encounter or you are dying, whenever a target makes a strike, they take holy damage equal to twice your Presence score. A target judged by you takes an extra 2d6 holy damage.')
			]
		}),
		FactoryLogic.createAbility({
			id: 'censor-ability-16',
			name: 'Edict of Stillness',
			description: 'Flee not from just punishment.',
			type: FactoryLogic.type.createManeuver(),
			keywords: [ AbilityKeyword.Area, AbilityKeyword.Magic ],
			distance: [ FactoryLogic.distance.create({ type: AbilityDistanceType.Aura, value: 2 }) ],
			target: 'Each enemy in the area',
			cost: 7,
			sections: [
				FactoryLogic.createAbilitySectionText('Until the end of the encounter or you are dying, whenever a target is force moved or moves willingly out of the aura, they take holy damage equal to twice your Presence score. A target judged by you who moves willingly takes an extra 2d6 holy damage.')
			]
		})
	],
	subclasses: [
		exorcist,
		oracle,
		paragon
	],
	level: 1,
	characteristics: []
};
