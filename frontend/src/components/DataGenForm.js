// frontend/src/components/DataGenForm.js
import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  button: {
    backgroundColor: 'red',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkred',
    },
  },
});

function DataGenForm({ onSubmit }) {
  const classes = useStyles();
  const [param, setParam] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(param);
  };

  return (
    <Container className={classes.container} maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Test Data Generator
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          label="Parameter"
          value={param}
          onChange={(e) => setParam(e.target.value)}
          margin="normal"
        />
        <Button className={classes.button} type="submit" variant="contained">
          Generate
        </Button>
      </form>
    </Container>
  );
}

export default DataGenForm;
