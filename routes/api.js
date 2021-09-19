'use strict'

const Joi = require('joi')
const { pick } = require('lodash')
const { Issue } = require('../models')

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      const filters = pick(req.query, ['created_by', 'assigned_to'])

      Issue.findAll({ where: filters }).then(issues => res.json(JSON.stringify(issues)))
    })

    .post(function (req, res) {
      const issue = pick(req.body, ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'])

      const validation = Joi.object({
        issue_title: Joi.string().required(),
        issue_text: Joi.string().required(),
        created_by: Joi.string().required(),
        assigned_to: Joi.string().optional(),
        status_text: Joi.string().optional(),
      }).validate(issue)

      if (validation.error) {
        return res.json({ error: 'required field(s) missing' })
      }

      Issue.create({ ...issue })
        .then(issue => res.json(issue.toJSON()))
        .catch(error => console.log(error))
    })

    .put(function (req, res) {
      let project = req.params.project
    })

    .delete(function (req, res) {
      let project = req.params.project
    })
}
