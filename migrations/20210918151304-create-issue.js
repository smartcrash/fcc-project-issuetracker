'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Issues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      issue_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      issue_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      created_by: {
        type: Sequelize.STRING,
        alllowNull: false,
      },

      assigned_to: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      open: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      status_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Issues')
  },
}
