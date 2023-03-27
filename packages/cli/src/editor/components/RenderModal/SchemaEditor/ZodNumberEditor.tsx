import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'remotion';
import {Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
import {RightAlignInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from '../layout';
import type {JSONPath} from './zod-types';

type LocalState = {
	value: string;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

export const ZodNumberEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: number;
	setValue: React.Dispatch<React.SetStateAction<number>>;
	compact: boolean;
}> = ({jsonPath, value, schema, setValue, compact}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value: String(value),
			zodValidation: schema.safeParse(value),
		};
	});

	const onChange = useCallback(
		(newValue: string) => {
			const safeParse = schema.safeParse(Number(newValue));
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(Number(newValue));
			}
		},
		[schema, setValue]
	);

	const onValueChange = useCallback(
		(newValue: number) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: String(newValue),
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newValue);
			}
		},
		[schema, setValue]
	);

	const style = useMemo(() => {
		if (compact) {
			return {...optionRow, paddingLeft: 0, paddingRight: 0};
		}

		return optionRow;
	}, [compact]);

	return (
		<div style={style}>
			<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						type={'number'}
						value={localValue.value}
						status={localValue.zodValidation.success ? 'ok' : 'error'}
						placeholder={jsonPath.join('.')}
						onTextChange={onChange}
						onValueChange={onValueChange}
						// TODO: Allow min / max / step with zod
						min={-Infinity}
						max={Infinity}
					/>
				</RightAlignInput>
				{!localValue.zodValidation.success && (
					<>
						<Spacing y={1} block />
						<ValidationMessage
							align="flex-end"
							message={localValue.zodValidation.error.format()._errors[0]}
							type="error"
						/>
					</>
				)}
			</div>
		</div>
	);
};
