from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    posts = db.relationship('Post', backref='author', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Post {self.title}>'


@app.route('/')
def home():
    users = User.query.all()
    print(users)
    return render_template('index.html', users=users)


@app.route('/create_user', methods=['GET', 'POST'])
def create_user():
    print("came inside this")
    if request.method == 'POST':
        username = request.form['username']
        new_user = User(username=username)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('user_posts', user_id=new_user.id))
    # return render_template('create_user.html')


@app.route('/user/<int:user_id>/posts', methods=['GET', 'POST'])
def user_posts(user_id):
    print(" Inside this ")
    user = User.query.get(user_id)
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        post = Post(title=title, content=content, user_id=user.id)
        db.session.add(post)
        db.session.commit()

    return render_template('user_posts.html', user=user)


@app.route('/all_posts')
def all_posts():
    # Query all posts except those of the currently logged-in user
    all_posts = Post.query.all()

    return render_template('all_posts.html', all_posts=all_posts)


@app.route('/user/<int:user_id>/delete_post/<int:post_id>')
def delete_post(user_id, post_id):
    post = Post.query.get(post_id)
    if post and post.user_id == user_id:
        db.session.delete(post)
        db.session.commit()
    return redirect(url_for('user_posts', user_id=user_id))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8080, debug=True)
