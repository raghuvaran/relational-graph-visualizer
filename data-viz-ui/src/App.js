import React from 'react';
import './App.css';
import Schema from './schema/schema';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

function TabPanel(props) {
  return props.value === props.index ? <Box>{props.children}</Box> : null;
}

export default function App() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className="App">
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Schema" />
          <Tab label="Data" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Schema />
      </TabPanel>
    </div>
  );
}