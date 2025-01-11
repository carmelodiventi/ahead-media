import React from 'react';
import { Grid, TextField } from '@radix-ui/themes';
import { InputIcon } from '@radix-ui/react-icons';
import SchemaBuilderModal from './modal';

import {Schema} from "../../../../../types/Workflow.types";

interface SchemaBuilderProps {
  value?: Schema;
  onChange: (value: Schema) => void;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ value, onChange }) => {
  const [showBuilderModal, setShowBuilderModal] = React.useState(false);

  return (
    <Grid gap={'2'}>
      <TextField.Root defaultValue={JSON.stringify(value)} readOnly onClick={() => setShowBuilderModal(!showBuilderModal)}>
        <TextField.Slot side={'right'}>
          <InputIcon />
        </TextField.Slot>
      </TextField.Root>

      <SchemaBuilderModal
        setShowBuilderModal={setShowBuilderModal}
        showBuilderModal={showBuilderModal}
        schema={value}
        onChange={onChange}
      />
    </Grid>
  );
};

export default SchemaBuilder;
