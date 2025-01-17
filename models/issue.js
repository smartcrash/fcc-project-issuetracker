'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {}

  Issue.init(
    {
      _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      issue_title: DataTypes.STRING,
      issue_text: DataTypes.STRING,
      created_on: DataTypes.DATE,
      updated_on: DataTypes.DATE,
      created_by: DataTypes.STRING,
      assigned_to: { type: DataTypes.STRING, defaultValue: '' },
      open: { type: DataTypes.BOOLEAN, defaultValue: true },
      status_text: { type: DataTypes.STRING, defaultValue: '' },
      projectname: { type: DataTypes.STRING },
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
