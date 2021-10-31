const chaiHttp = require('chai-http')
const chai = require('chai')
const { times } = require('lodash')
const faker = require('faker')
const { assert, expect } = chai
const chaiDateString = require('chai-date-string')

const server = require('../server')
const { Issue } = require('../models')

chai.use(chaiHttp)
chai.use(chaiDateString)

suite('Functional Tests', function () {
  setup(() => Issue.destroy({ where: {} }))

  /** You can send a POST request to /api/issues/{projectname} with form data
   * containing the required fields issue_title, issue_text, created_by, and
   * optionally assigned_to and status_text. You can send a POST request
   * to /api/issues/{projectname} with form data containing the required fields
   * issue_title, issue_text, created_by, and optionally assigned_to and status_text.
   *
   * The POST request to /api/issues/{projectname} will return the created object,
   * and must include all of the submitted fields.
   *
   * */

  test('Create an issue with every field: POST request to /api/issues/{project}', done => {
    const issue_title = faker.lorem.sentence()
    const issue_text = faker.lorem.sentences()
    const created_by = faker.name.firstName()
    const assigned_to = faker.name.firstName()
    const status_text = faker.lorem.word()

    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.type, 'application/json')

        const data = res.body

        assert.isObject(data)
        assert.nestedInclude(data, { issue_title, issue_text, created_by, assigned_to, status_text })
        assert.property(data, '_id')
        assert.isNotEmpty(data._id)

        /** Additionally, include created_on (date/time),
         * updated_on (date/time), open (boolean, true for open - default value, false
         * for closed), and _id.
         * */
        assert.property(data, 'created_on')
        assert.isNumber(Date.parse(data.created_on))
        assert.property(data, 'updated_on')
        assert.isNumber(Date.parse(data.updated_on))
        assert.property(data, 'open')
        assert.isBoolean(data.open)
        assert.isTrue(data.open)

        done()
      })
  })

  test('Create an issue with only required fields: POST request to /api/issues/{project}', done => {
    const issue_title = faker.lorem.sentence()
    const issue_text = faker.lorem.sentences()
    const created_by = faker.name.firstName()

    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({
        issue_title,
        issue_text,
        created_by,
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.type, 'application/json')

        /** Excluded optional fields will
         * be returned as empty strings.
         * */

        const data = res.body

        assert.property(data, 'status_text')
        assert.isEmpty(data.status_text)
        assert.property(data, 'assigned_to')
        assert.isEmpty(data.assigned_to)

        done()
      })
  })

  /**
   * If you send a POST request to /api/issues/{projectname} without the required fields,
   * returned will be the error { error: 'required field(s) missing' }
   */
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.type, 'application/json')

        expect(res.body).to.eql({ error: 'required field(s) missing' })
        done()
      })
  })

  test('View issues on a project: GET request to /api/issues/{project}', done => {
    const mockIssues = times(3, index => ({
      issue_title: `Issue ${index + 1}`,
      issue_text: faker.lorem.sentences(),
      created_by: faker.name.firstName(),
    }))

    const url = '/api/issues/get_issues_test_' + Date.now().toString().substring(7)

    Promise.all(mockIssues.map(issue => chai.request(server).post(url).send(issue))).then(([data1, data2, data3]) => {
      assert.isObject(data1)
      assert.isObject(data2)
      assert.isObject(data3)

      chai
        .request(server)
        .get(url)
        .end((err, res) => {
          expect(res).to.be.json

          // const issues = JSON.parse(res.body)
          const issues = res.body

          assert.isArray(issues)
          assert.lengthOf(issues, 3)

          const regexp = /Issue \d/

          issues.forEach(issue => {
            assert.property(issue, 'issue_title')
            assert.match(issue.issue_title, regexp)
            assert.property(issue, 'issue_text')
            assert.property(issue, 'created_by')
            assert.property(issue, 'assigned_to')
            assert.property(issue, 'status_text')
            assert.property(issue, 'open')
            assert.property(issue, 'created_on')
            assert.property(issue, 'updated_on')
            assert.property(issue, '_id')
          })

          done()
        })
    })
  })

  /** You can send a GET request to /api/issues/{projectname} and filter the
   * request by also passing along any field and value as a URL query
   * (ie. /api/issues/{project}?open=false). You can pass one or more
   * field/value pairs at once.
   * */

  test('View issues on a project with one filter: GET request to /api/issues/{project}', done => {
    const mockIssue = {
      issue_title: faker.lorem.sentence(),
      issue_text: faker.lorem.sentences(),
    }

    Promise.all([
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Alice' }),
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Alice' }),
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Carol' }),
    ]).then(() => {
      chai
        .request(server)
        .get('/api/issues/{project}?created_by=Alice')
        .end((err, res) => {
          assert.isArray(res.body)
          assert.lengthOf(res.body, 2)

          chai
            .request(server)
            .get('/api/issues/{project}?created_by=Carol')
            .end((err, res) => {
              assert.isArray(res.body)
              assert.lengthOf(res.body, 1)
              done()
            })
        })
    })
  })

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', done => {
    const mockIssue = {
      issue_title: faker.lorem.sentence(),
      issue_text: faker.lorem.sentences(),
    }

    Promise.all([
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Alice', assigned_to: 'Bob' }),
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Alice', assigned_to: 'Bob' }),
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Alice', assigned_to: 'Eric' }),
      chai
        .request(server)
        .post('/api/issues/{project}')
        .send({ ...mockIssue, created_by: 'Carol', assigned_to: 'Eric' }),
    ]).then(() => {
      chai
        .request(server)
        .get('/api/issues/{project}?created_by=Alice&assigned_to=Bob')
        .end((err, res) => {
          assert.isArray(res.body)
          assert.lengthOf(res.body, 2)

          chai
            .request(server)
            .get('/api/issues/{project}?created_by=Carol&assigned_to=Eric')
            .end((err, res) => {
              assert.isArray(res.body)
              assert.lengthOf(res.body, 1)
              done()
            })
        })
    })
  })

  /** You can send a PUT request to /api/issues/{projectname} with an _id and
   * one or more fields to update. On success, the updated_on field should be
   * updated, and returned should be {  result: 'successfully updated', '_id': _id }.
   * */

  test('Update one field on an issue: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({
        issue_title: faker.lorem.sentence(),
        issue_text: faker.lorem.sentences(),
        created_by: faker.name.firstName(),
      })
      .end((err, res) => {
        const itemToUpdate = res.body

        chai
          .request(server)
          .put('/api/issues/{project}')
          .send({ _id: itemToUpdate._id, issue_text: 'New Issue Text' })
          .end((err, res) => {
            expect(res.body).to.eql({
              result: 'successfully updated',
              _id: itemToUpdate._id,
            })

            chai
              .request(server)
              .get(`/api/issues/{project}?_id=${itemToUpdate._id}`)
              .end((err, res) => {
                const body = res.body
                assert.isArray(body)
                assert.isObject(body[0])
                assert.equal(body[0].issue_text, 'New Issue Text')
                assert.isAbove(Date.parse(body[0].updated_on), Date.parse(body[0].created_on))
                done()
              })
          })
      })
  })

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({
        issue_title: faker.lorem.sentence(),
        issue_text: faker.lorem.sentences(),
        created_by: faker.name.firstName(),
      })
      .end((err, res) => {
        const itemToUpdate = res.body

        chai
          .request(server)
          .put('/api/issues/{project}')
          .send({
            _id: itemToUpdate._id,
            issue_title: 'New Issue Title',
            issue_text: 'New Issue Text',
          })
          .end((err, res) => {
            expect(res.body).to.eql({
              result: 'successfully updated',
              _id: itemToUpdate._id,
            })

            chai
              .request(server)
              .get(`/api/issues/{project}?_id=${itemToUpdate._id}`)
              .end((err, res) => {
                const body = res.body
                assert.isArray(body)
                assert.isObject(body[0])
                assert.equal(body[0].issue_title, 'New Issue Title')
                assert.equal(body[0].issue_text, 'New Issue Text')
                assert.isAbove(Date.parse(body[0].updated_on), Date.parse(body[0].created_on))
                done()
              })
          })
      })
  })

  /**
   * When the PUT request sent to /api/issues/{projectname} does not include an
   * _id, the return value is { error: 'missing _id' }.
   */
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/{project}')
      .send({
        issue_title: 'New Issue Title',
        issue_text: 'New Issue Text',
      })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'missing _id' })
        done()
      })
  })

  /** When the PUT request sent to /api/issues/{projectname} does not include
   * update fields, the return value is { error: 'no update field(s) sent', '_id': _id }.
   * On any other error, the return value is { error: 'could not update', '_id': _id }.
   * */
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/{project}')
      .send({ _id: 1 })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: 1 })
        done()
      })
  })

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', done => {
    chai
      .request(server)
      .put('/api/issues/{project}')
      .send({
        _id: 'f00b4r',
        issue_text: faker.lorem.sentences(),
      })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'could not update', _id: 'f00b4r' })
        done()
      })
  })

  /**
   * You can send a DELETE request to /api/issues/{projectname} with an _id to
   * delete an issue. If no _id is sent, the return value is { error: 'missing _id' }.
   * On success, the return value is { result: 'successfully deleted', '_id': _id }.
   * On failure, the return value is { error: 'could not delete', '_id': _id }.
   */
  test('Delete an issue: DELETE request to /api/issues/{project}', done => {
    chai
      .request(server)
      .post('/api/issues/{project}')
      .send({
        issue_title: faker.lorem.sentence(),
        issue_text: faker.lorem.sentences(),
        created_by: faker.name.firstName(),
      })
      .end((err, res) => {
        const itemToDelete = res.body

        chai
          .request(server)
          .delete('/api/issues/{project}')
          .send({ _id: itemToDelete._id })
          .end((err, res) => {
            assert.deepEqual(res.body, { result: 'successfully deleted', _id: itemToDelete._id })

            chai
              .request(server)
              .get(`/api/issues/{project}?_id=${itemToDelete._id}`)
              .end((err, res) => {
                assert.isArray(res.body)
                assert.lengthOf(res.body, 0)
                done()
              })
          })
      })
  })

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', done => {
    chai
      .request(server)
      .delete('/api/issues/{project}')
      .send({ _id: 'f00b4r' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'could not delete', _id: 'f00b4r' })
        done()
      })
  })

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', done => {
    chai
      .request(server)
      .delete('/api/issues/{project}')
      .send({})
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'missing _id' })
        done()
      })
  })
})
