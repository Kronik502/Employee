const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3002;

app.use(bodyParser.json());

// Route to handle GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Employee API!');
});

app.get('/employees', (req, res) => {
  fs.readFile('database.json', (err, data) => {
    if (err) {
      console.error('Error reading database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    try {
      const employees = JSON.parse(data).employees;
      res.json(employees);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.post('/employees', (req, res) => {
  fs.readFile('database.json', (err, data) => {
    if (err) {
      console.error('Error reading database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    try {
      const json = JSON.parse(data);
      const newEmployee = req.body;
      newEmployee.id = json.employees.length > 0 ? json.employees[json.employees.length - 1].id + 1 : 1; // Incrementing ID
      json.employees.push(newEmployee);
      fs.writeFile('database.json', JSON.stringify(json, null, 2), (err) => {
        if (err) {
          console.error('Error writing to database:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Employee added successfully', employee: newEmployee });
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.delete('/employees/:id', (req, res) => {
  const employeeId = parseInt(req.params.id);
  fs.readFile('database.json', (err, data) => {
    if (err) {
      console.error('Error reading database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    try {
      const json = JSON.parse(data);
      const updatedEmployees = json.employees.filter(emp => emp.id !== employeeId);
      if (updatedEmployees.length === json.employees.length) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      json.employees = updatedEmployees;
      fs.writeFile('database.json', JSON.stringify(json, null, 2), (err) => {
        if (err) {
          console.error('Error writing to database:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Employee removed successfully', id: employeeId });
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
