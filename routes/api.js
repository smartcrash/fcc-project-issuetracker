'use strict'

const Joi = require('joi')
const { pick, omit, isUndefined, isNull, keys, compact } = require('lodash')
const { Issue } = require('../models')

module.exports = function (app) {
  app
    .route('/api/issues/:projectname')

    .get(function (req, res) {
      const { projectname } = req.params
      const filters = pick(req.query, ['_id', 'created_by', 'assigned_to', 'open'])
      if (filters.open) filters.open = filters.open === 'true' ? true : false

      Issue.findAll({ where: { ...filters, projectname } }).then(issues => res.json(JSON.stringify(issues)))
    })

    .post(function (req, res) {
      const { projectname } = req.params
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

      Issue.create({ ...issue, projectname })
        .then(issue =>
          res.json({
            ...issue.toJSON(),
            _id: String(issue._id),
          })
        )
        .catch(error => console.log(error))
    })

    .put(function (req, res) {
      const { _id } = req.body
      const update = omit(req.body, ['_id'])

      if (isUndefined(_id) || isNull(_id)) return res.json({ error: 'missing _id' })
      if (keys(update).length === 0) return res.json({ error: 'no update field(s) sent', _id })

      Issue.update({ ...update }, { where: { _id } })
        .then(result => {
          if (result[0] > 0) {
            res.json({ result: 'successfully updated', _id })
          } else {
            res.json({ error: 'could not update', _id })
          }
        })
        .catch(() => res.json({ error: 'could not update', _id }))
    })

    .delete(function (req, res) {
      const { _id } = req.body

      if (isUndefined(_id) || isNull(_id)) return res.json({ error: 'missing _id' })

      Issue.destroy({ where: { _id } })
        .then(result => {
          if (result) {
            res.json({ result: 'successfully deleted', _id })
          } else {
            res.json({ error: 'could not delete', _id })
          }
        })
        .catch(() => res.json({ error: 'could not delete', _id }))
    })
}
