const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for current user (across all projects)
router.get('/', async (req, res) => {
  try {
    const userProjects = await Project.find({ owner: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const { status, priority, search } = req.query;
    let query = { project: { $in: projectIds } };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('project', 'title color icon')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const project = await Project.findOne({ _id: req.body.project, owner: req.user._id });
    if (!project) return res.status(403).json({ success: false, message: 'Project not found or unauthorized' });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate(['assignee', 'createdBy']);

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title color icon owner')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.author', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Check ownership
    if (task.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
router.post('/:id/comments', [
  body('text').trim().notEmpty().withMessage('Comment cannot be empty')
], async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ text: req.body.text, author: req.user._id });
    await task.save();
    await task.populate('comments.author', 'name email');

    res.status(201).json({ success: true, comments: task.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status only (for drag-and-drop)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignee', 'name email');

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
