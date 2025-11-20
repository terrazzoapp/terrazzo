import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { CaretSort, Cross } from '@terrazzo/icons';
import { Button, SubtleInput } from '@terrazzo/tiles';
import type { FontFamilyTokenNormalized } from '@terrazzo/token-tools';
import { useReducer } from 'react';
import c from './EditableFontFamilyToken.module.css';

type SortableProps = {
  id: string | number;
  index: number;
  children?: React.ReactNode;
};

function Sortable({ id, index, children }: SortableProps) {
  const { ref } = useSortable({ id, index });

  return (
    <li ref={ref} className={c.item}>
      <CaretSort />
      {children}
    </li>
  );
}

// function SortableList() {
//   const items = [1, 2, 3, 4];

//   return (
//     <ul className={c.list}>
//       {items.map((id, index) => (
//         <Sortable key={id} id={id} index={index} />
//       ))}
//     </ul>
//   );
// }

export interface EditableFontFamilyTokenProps {
  id: string;
  mode?: string;
  value: FontFamilyTokenNormalized;
}

type FontFamilyItem = {
  id: string;
  value: string;
};

type FontFamilyState = FontFamilyItem[];

const ADD_FONT_FAMILY = 'ADD_FONT_FAMILY';
const REMOVE_FONT_FAMILY = 'REMOVE_FONT_FAMILY';
const UPDATE_FONT_FAMILY = 'UPDATE_FONT_FAMILY';
const INITIALIZE = 'INITIALIZE';
const UPDATE_FONT_FAMILY_LIST = 'UPDATE_FONT_FAMILY_LIST';

type FontFamilyAction =
  | { type: typeof ADD_FONT_FAMILY; payload: { id: string } }
  | { type: typeof REMOVE_FONT_FAMILY; payload: { id: string } }
  | { type: typeof UPDATE_FONT_FAMILY; payload: { id: string; value: string } }
  | { type: typeof INITIALIZE; payload: FontFamilyItem[] }
  | { type: typeof UPDATE_FONT_FAMILY_LIST; payload: FontFamilyItem[] };

const generateFontFamilyList = (value: FontFamilyTokenNormalized): FontFamilyItem[] => {
  return value.$value.map((fontName, index) => ({
    id: `font-${index}`,
    value: fontName,
  }));
};

const fontFamilyReducer = (state: FontFamilyState, action: FontFamilyAction): FontFamilyState => {
  switch (action.type) {
    case INITIALIZE:
      return action.payload;
    case ADD_FONT_FAMILY:
      return [...state, { id: action.payload.id, value: '' }];
    case REMOVE_FONT_FAMILY:
      return state.filter((item) => item.id !== action.payload.id);
    case UPDATE_FONT_FAMILY:
      return state.map((item) => (item.id === action.payload.id ? { ...item, value: action.payload.value } : item));
    case UPDATE_FONT_FAMILY_LIST:
      return action.payload;
    default:
      return state;
  }
};

const useFontFamily = (value: FontFamilyTokenNormalized) => {
  const defaultFontFamilyList = generateFontFamilyList(value);
  const [fontFamilyList, dispatch] = useReducer(fontFamilyReducer, defaultFontFamilyList);

  const setFontFamilyList = (list: FontFamilyItem[]) => {
    dispatch({ type: INITIALIZE, payload: list });
  };

  const addFontFamily = () => {
    const newId = `font-${fontFamilyList.length}`;
    dispatch({ type: ADD_FONT_FAMILY, payload: { id: newId } });
  };

  const removeFontFamily = (id: string) => {
    dispatch({ type: REMOVE_FONT_FAMILY, payload: { id } });
  };

  const updateFontFamily = (id: string, value: string) => {
    dispatch({ type: UPDATE_FONT_FAMILY, payload: { id, value } });
  };

  return {
    fontFamilyList,
    setFontFamilyList,
    addFontFamily,
    removeFontFamily,
    updateFontFamily,
  };
};

export default function EditableFontFamilyToken({ value }: EditableFontFamilyTokenProps) {
  const { fontFamilyList, setFontFamilyList, addFontFamily, removeFontFamily, updateFontFamily } = useFontFamily(value);

  return (
    <div className={c.container}>
      <DragDropProvider
        onDragEnd={(event) => {
          setFontFamilyList(move(fontFamilyList, event));
        }}
      >
        <ul className={c.list}>
          {fontFamilyList.map((item, index) => (
            <Sortable key={item.id} id={item.id} index={index}>
              <SubtleInput
                className={c.input}
                value={item.value}
                type='text'
                onChange={(e) => updateFontFamily(item.id, e.target.value)}
                placeholder='Font Family...'
              />
              <Button
                className={c.removeButton}
                aria-label='Remove font family'
                type='button'
                onClick={() => removeFontFamily(item.id)}
                size='s'
                variant='orange'
              >
                <Cross />
              </Button>
            </Sortable>
          ))}
        </ul>
      </DragDropProvider>
      <div>
        <Button type='button' onClick={addFontFamily} size='s'>
          + Add Font Family
        </Button>
      </div>
    </div>
  );
}
