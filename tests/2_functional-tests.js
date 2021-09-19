const chaiHttp = require('chai-http')
const chai = require('chai')
const faker = require('faker')
const { assert, expect } = chai
const chaiDateString = require('chai-date-string')

const server = require('../server')

chai.use(chaiHttp)
chai.use(chaiDateString)

suite('Functional Tests', function () {
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

        expect(res.body.issue_title).equal(issue_title)
        expect(res.body.issue_text).equal(issue_text)
        expect(res.body.created_by).equal(created_by)
        expect(res.body.assigned_to).equal(assigned_to)
        expect(res.body.status_text).equal(status_text)

        /** Additionally, include created_on (date/time),
         * updated_on (date/time), open (boolean, true for open - default value, false
         * for closed), and _id.
         * */
        expect(res.body.created_on).to.be.a.dateString()
        expect(res.body.updated_on).to.be.a.dateString()
        expect(res.body.open).equal(true)

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

        expect(res.body.assigned_to).equal('')
        expect(res.body.status_text).equal('')

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

  test('View issues on a project: GET request to /api/issues/{project}')

  test('View issues on a project with one filter: GET request to /api/issues/{project}')

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}')

  test('Update one field on an issue: PUT request to /api/issues/{project}')

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}')

  test('Update an issue with missing _id: PUT request to /api/issues/{project}')

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}')

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}')

  test('Delete an issue: DELETE request to /api/issues/{project}')

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}')

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}')
})
