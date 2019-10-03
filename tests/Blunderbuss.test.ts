import { assert } from "chai"
import { Blunderbuss } from "../src/Blunderbuss"
import { GitlabUsersDecorator } from "../src/GitlabUsersDecorator";
import { UsersMock } from "./UsersMock";
import { SnippetsMock } from "./SnippetsMock";
import { MergeRequestEventAttributes } from "../src/MergeRequestEventAttributes";
import { RepositoryFilesMock } from "./RepositoryFilesMock";
import { RepositoryFiles, Snippet } from "../src/GitProvider";
import { User } from "../src/User";
import { RepoBlob } from "../src/RepoBlob";

suite('Blunderbuss', () => {

    const usersMockData = <User[]>[
        { id: 1, name: "john", username: "john", weight: 4 },
        { id: 2, name: "bob", username: "bob", weight: 3 },
        { id: 3, name: "rick", username: "rick", weight: 1 },
        { id: 4, name: "dick", username: "dick", weight: 2 },
    ]
    const snippetsMockData = <Snippet[]>[
        { id: 1, author: usersMockData[0], file_name: '', title: 'foo' }
    ];
    
    const snippetsMock = new SnippetsMock(snippetsMockData)
    const users = new GitlabUsersDecorator(new UsersMock(usersMockData), snippetsMock, 'foo')
    const filesMock = new RepositoryFilesMock()
    const mrEvt: MergeRequestEventAttributes = <MergeRequestEventAttributes>{ author_id: 3 }
    const blunderbuss = new Blunderbuss(users, 528, mrEvt, filesMock)

    test('Snippets.all', done => {
        snippetsMock.all()
            .then(snippets => {
                assert.isArray(snippets)
                assert.equal((<Snippet[]>snippets).length, 1)
                assert.equal((<Snippet[]>snippets)[0].id, 1)
                done()
            })
            .catch(err => done(err))
    })

    test('Snippets.content', done => {
        snippetsMock.content(1)
            .then(snippet => {
                assert.isString(snippet)
                assert.equal(snippet, 'reviewers:\n- john')
                done()
            })
            .catch(err => done(err))
    })

    test('Users.all', done => {
        users.all()
            .then(users => {
                assert.isArray(users)
                done()
            })
            .catch(err => done(err))
    })

    test('Users.show', done => {
        users.show(3)
            .then(u => {
                assert.equal(u, usersMockData[2])
                done()
            })
            .catch(err => done(err))
    })

    test('Files.show', done => {
        filesMock.show(528,'','')
            .then(blob => {
                assert.equal((<RepoBlob>blob).content, 
                    'cmV2aWV3ZXJzOgotIGpvaG4KLSByaWNrCi0gYm9iCi0gZGljawphcHByb3ZlcnM6Ci0gam9obgotIHJpY2sKLSBib2IKLSBkaWNr')
                done()
            })
            .catch(err => done(err))
    })

    test('Blunderbuss.author', done => {
        blunderbuss.getAuthor()
            .then(a => {
                assert.equal(a.id, mrEvt.author_id)
                done()
            })
            .catch(err => done(err))
    })

    test('Approver is not author', done => {
        blunderbuss.selectApprover()
            .then(a => {
                assert.notEqual(a.id, mrEvt.author_id)
                done()
            })
            .catch(err => done(err))
    })

    test('2 selected reviewers has the lowest weight', done => {
        blunderbuss.selectReviewers()
            .then(revs => {
                assert.isArray(revs)
                assert.equal(revs.length, 2)
                assert.isTrue(revs.includes(usersMockData[0]))
                assert.isTrue(revs.includes(usersMockData[1]))
                done()
            })
            .catch(err => done(err))
    })
})