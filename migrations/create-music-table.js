'use strict';

const sequelize = require('sequelize');

const { DataTypes } = sequelize;

const TABLE_NAME = 'music';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          composer: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          work: {
            type: DataTypes.STRING,
          },
          work_number: {
            type: DataTypes.STRING,
          },
          type: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          item_number: {
            type: DataTypes.STRING,
          },
          conductor: {
            type: DataTypes.TEXT,
          },
        },
        { transaction },
      );
      await queryInterface.addIndex(TABLE_NAME, ['composer'], {
        name: `${TABLE_NAME}_composer_col_index`,
        transaction,
      });
      await queryInterface.addIndex(TABLE_NAME, ['type'], {
        name: `${TABLE_NAME}_type_col_index`,
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      wlf.error('migration error: ', { err });
      await transaction.rollback();
    }
  },
  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
