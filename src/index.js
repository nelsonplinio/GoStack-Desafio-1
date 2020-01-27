const express = require('express');
const server = express();

const projects = [];
let requestCount = 0;
server.use(express.json());

function checkProject(req, res, next) {
  const {id} = req.params;
  
  const index = (projects.findIndex(({id: _id}) => _id === id));
  if (index === -1) {
    return res.status(404).json({message: 'Project not found'});
  }

  req.projectIndex = index;
  
  next();
}

function requestCounter(req, res, next) {
  requestCount += 1;
  console.log('Quantidade de requisições', requestCount)
  next();
}

server.use(requestCounter);

server.post('/projects', (req, res) => {
  const { id, title } = req.body;

  if (id === undefined || typeof id !== 'string') {
    return res.status(400).json({ message: 'Id incorreto.' })
  }

  if (title === undefined) {
    return res.status(400).json({ message: 'title não informado.' })
  }

  const index = projects.findIndex(({ id: _id }) => _id === id);

  let project;

  if (index !== -1) {
    project = projects[index];

  } else {
    project = {
      id,
      title,
      tasks: [],
    };
  }

  projects.push(project);
  return res.json(projects);
})

server.get('/projects', (req, res) => {
  return res.json(projects);
});

server.put('/projects/:id', checkProject, (req, res) => {
  const { title } = req.body;

  const project = projects[req.projectIndex];
  project.title = title;

  return res.json(project);
})

server.delete('/projects/:id', checkProject, (req, res) => {
  const {projectIndex} = req;
  projects.splice(projectIndex, 1);

  return res.json(projects);
})

server.post('/projects/:id/tasks', checkProject, (req, res) => {
  const {projectIndex} = req;
  const project = projects[projectIndex];

  const {title: task} = req.body;

  project.tasks = [
    ...project.tasks,
    task
  ];
  return res.json(project);
});

server.listen(3000);
