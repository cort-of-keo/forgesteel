import { CSSProperties, ReactNode } from 'react';

import './pill.scss';

interface Props {
	style?: CSSProperties;
	children?: ReactNode;
}

export const Pill = (props: Props) => (
	<span className='pill' style={props.style}>
		{props.children}
	</span>
);

interface ResourcePillProps {
	value: ReactNode;
	repeatable?: boolean;
	units?: string;
	style?: CSSProperties;
}

export const ResourcePill = (props: ResourcePillProps) => {
	return (
		<Pill style={props.style}>
			{props.value}{props.units ?? (props.value === 1 ? 'pt' : 'pts')} {props.repeatable ? '+' : ''}
		</Pill>
	);
};
