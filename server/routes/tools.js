const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /tools - Fetch all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tools', async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim() || !description?.trim()) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  try {
    const tool = await prisma.tool.create({
      data: { name: name.trim(), description: description.trim(), isAvailable: true }
    });
    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tool' });
  }
});

// PATCH /tools/:id - Borrow/Return tool
router.patch("/tools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const existingTool = await prisma.tool.findUnique({ where: { id: parseInt(id) } });
    
    if (existingTool) {
      const updatedTool = await prisma.tool.update({
        where: { id: parseInt(id) },
        data: { isAvailable: !existingTool.isAvailable }
      });
      res.json(updatedTool);
    } else {
      res.status(404).json({ message: "Tool not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
