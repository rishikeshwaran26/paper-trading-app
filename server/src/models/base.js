'use strict';

const db = require('../config/database');

function run(sql, params = []) {
  const conn = db.get();
  conn.run(sql, params);
}

function getRow(sql, params = []) {
  const conn = db.get();
  const stmt = conn.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

function getAll(sql, params = []) {
  const conn = db.get();
  const stmt = conn.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function lastInsertId() {
  const result = db.get().exec('SELECT last_insert_rowid() AS id');
  return result[0].values[0][0];
}

module.exports = { run, getRow, getAll, lastInsertId };
