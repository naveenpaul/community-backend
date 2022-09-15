
const mongoose = require('mongoose');

const filesSchema = new mongoose.Schema({
  sourceId: String,
  source: {
    type: String,
    enum: ['project', 'team', 'task', 'escalation', 'payment', 'inventory', 'userProfile']
  },
  projectId: String,
  sectionId: String,
  type: String,
  fileName: String,
  uniqFileName: String,
  tag: {
    tagName: String,
    color: String
  }
}, { timestamps: true });

const Files = mongoose.model('files', filesSchema);

module.exports = Files;