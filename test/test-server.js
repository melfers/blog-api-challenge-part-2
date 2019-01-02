const chai = require ("chai");
const chaiHttp = require ("chai-http");

const {app, runServer, closeServer} = require ("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Blog Post", function() {
    before(function() {
        return runServer();
    });
    after(function() {
        return closeServer();
    });
    it("Should list blog posts on GET", function() {
        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.at.least(1);
                
                const requiredKeys = ["title", "content", "author"];
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(requiredKeys);
                });
            });
    });
    it("Should add a new blog post on POST", function() {
        const newItem = {title: "title", content: "content", author: "author"};
        return chai
            .request(app)
            .post("/blog-posts")
            .send(newItem)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(res.body).to.include.keys("title", "content", "author");
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal(
                    Object.assign(newItem, { id: res.body.id }, {publishDate: res.body.publishDate})
                  );
            });
    });
    it("Should edit an existing blog post on PUT", function() {
        return chai
            .request(app)
                .get("/blog-posts")
                .then(function(res){
                    const updatedPost = Object.assign(res.body[0], {
                        title: "Hello there",
                        content: "hi there"
                    });
                    return chai.request(app)
                    .put(`/blog-posts/${res.body[0].id}`)
                    .send(updatedPost)
                    .then(function(res) {
                        expect(res).to.have.status(204);
                    });
                })
    });
    it("Should delete a post on DELETE", function(){
        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res) {
                return chai.request(app)
                .delete(`/blog-posts/${res.body[0].id}`)
                .then(function(res) {
                    expect(res).to.have.status(204);
                });
            })
    });
});