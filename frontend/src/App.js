
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, CssBaseline, Typography, TextField, TextareaAutosize, CircularProgress, Snackbar, Paper } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '15px',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  analysis: {
    margin: theme.spacing(3, 0),
    textAlign: 'center',
    fontWeight: 'bold'
  },
  textarea: {
    width: '100%',
    padding: theme.spacing(1),
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: theme.spacing(2),
    fontFamily: theme.typography.fontFamily
  }
}));

function App() {
  const classes = useStyles();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    
    if (!file) {
      setError("Please upload a file for data generation");
      return;
    }

    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('sampleFile', file);
        const response = await axios.post('http://localhost:4028/getAnalysis', formData);
        setAnalysis(response.data.analysis);
        setLoading(false);
        setSubmitted(true);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        setLoading(false);
        setError('Error fetching the analysis. Please try again.');
    }
  };
  const resetToInitialState = () => {
    setFile(null);
    setDownloaded(false);
    setSubmitted(false);
    setAnalysis("");
    setUserResponse("");
    document.getElementById("file").value = "";
  };
  const downloadExcel = async () => {
    try {
      const response = await axios.get('http://localhost:4028/generateExcel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading the Excel file:', error);
      setError('Error downloading the file. Please try again.');
    }
  };

  const handleSubmitToOpenAI = async () => {
    setLoading(true);
    setTimeout(async () => {
        try {
          await downloadExcel();
          setLoading(false);
          setDownloaded(true);
          resetToInitialState();
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
            setError('Error processing your request. Please try again.');
        }
    }, 5000);
  };

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Paper elevation={3} className={classes.paper}>
        <Typography component="h1" variant="h4" className={classes.title}>
          JLL's Data Doppelgänger
        </Typography>
        {loading ? <CircularProgress size={68} /> : (
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="file"
              label="Upload File"
              type="file"
              autoComplete="off"
              autoFocus
              onChange={handleFileChange}
              error={!!error}
              helperText={error}
            />
            {!submitted ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleGenerate}
                disabled={!file}
              >
                Generate Data
              </Button>
            ) : (
              <>
                <Typography variant="body1" className={classes.analysis}>
                  {analysis}
                </Typography>
                <TextareaAutosize
                  rowsMin={3}
                  placeholder="Type your response here..."
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className={classes.textarea}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  className={classes.submit}
                  onClick={handleSubmitToOpenAI}
                >
                  Submit to OpenAI
                </Button>
              </>
            )}
          </form>
        )}
        <Snackbar open={downloaded} autoHideDuration={6000} onClose={() => {
          setDownloaded(false);
          setFile(null);
          document.getElementById("file").value = "";
        }}>
          <Alert onClose={() => setDownloaded(false)} severity="success">
            File downloaded successfully!
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default App;

