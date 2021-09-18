'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {}

  Issue.init(
    {
      issue_title: DataTypes.STRING,
      issue_text: DataTypes.STRING,
      created_on: DataTypes.DATE,
      updated_on: DataTypes.DATE,
      created_by: DataTypes.STRING,
      assigned_to: DataTypes.STRING,
      open: DataTypes.BOOLEAN,
      status_text: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Issue',
      timestamps: true,
      createdAt: 'created_on',
      updatedAt: 'updated_on',
    }
  )
  return Issue
}
