import React, { useContext, useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';
import { Button, Card, Form, Grid, Image, Icon, Label } from 'semantic-ui-react';

import { AuthContext } from '../context/auth';
import LikeButton from '../components/LikeButton';
import DeleteButton from '../components/DeleteButton';
import { FETCH_SINGLEPOST_QUERY, SUBMIT_COMMENT_MUTATION } from '../util/graphql';

function SinglePost(props) {
  const postId = props.match.params.postId;
  const { user } = useContext(AuthContext);
  const commentInputRef = useRef(null);

  const [comment, setComment] = useState('');

  const { data = {} } = useQuery(FETCH_SINGLEPOST_QUERY, { variables: { postId } });

  const thisPost = data.getPost;

  const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
    update() {
      setComment('');
      commentInputRef.current.blur();
    },
    variables: {
      postId,
      body: comment,
    },
  });

  function deleteButtonCallback() {
    props.history.push('/');
  }

  let postMarkup;
  if (!thisPost) {
    postMarkup = <p>Loading post..</p>;
  } else {
    const { id, body, createdAt, username, comments, likes, likeCount, commentCount } = thisPost;

    postMarkup = (
      <Grid>
        <Grid.Row>
          <Grid.Column width={2}>
            <Image src="https://react.semantic-ui.com/images/avatar/large/molly.png" size="small" float="right" />
          </Grid.Column>
          <Grid.Column width={10}>
            <Card fluid key={id}>
              <Card.Content>
                <Card.Header>{username}</Card.Header>
                <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                <Card.Description>{body}</Card.Description>
              </Card.Content>
              <hr />
              <Card.Content extra>
                <LikeButton user={user} post={{ id, likeCount, likes }} />
                <Button as="div" labelPosition="right" onClick={() => console.log('Comment on post')}>
                  <Button basic color="blue">
                    <Icon name="comments" />
                  </Button>
                  <Label basic color="blue" pointing="left">
                    {commentCount}
                  </Label>
                </Button>
                {user && user.username === username && <DeleteButton postId={id} callback={deleteButtonCallback} />}
              </Card.Content>
            </Card>
            {user && (
              <Card fluid>
                <Card.Content>
                  <p>Post a new comment</p>
                  <Form>
                    <div className="ui action input fluid">
                      <input typo="text" placeholder="comment" name="comment" value={comment} onChange={(e) => setComment(e.target.value)} ref={commentInputRef} />
                      <button type="submit" className="ui button blue" disabled={comment.trim() === ''} onClick={submitComment}>
                        Submit
                      </button>
                    </div>
                  </Form>
                </Card.Content>
              </Card>
            )}
            {comments.map((comment) => (
              <Card fluid key={comment.Id}>
                <Card.Content>
                  {user && user.username === comment.username && <DeleteButton postId={id} commentId={comment.id} />}
                  <Card.Header>{comment.username}</Card.Header>
                  <Card.Meta>{moment(comment.createdAt).fromNow()} </Card.Meta>
                  <Card.Description>{comment.body} </Card.Description>
                </Card.Content>
              </Card>
            ))}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
  return postMarkup;
}

export default SinglePost;
