const axios = require("axios");
const fs = require("fs");
const urlPosts = "https://jsonplaceholder.typicode.com/posts";
const urlUsers = "https://jsonplaceholder.typicode.com/users";
const limit = 10;
const idOfNeededUser = 2;
let jsonUsers;
let jsonPosts;

const getPosts = () => {
  return axios.get(urlPosts);
};
const getUsers = () => {
  return axios.get(urlUsers);
};

const getComments = (posts, idOfNeededUser) => {
  let promises = [];
  posts.forEach((element) => {
    if (element.userId === idOfNeededUser) {
      promises.push(
        axios.get(
          `https://jsonplaceholder.typicode.com/posts/${element.id}/comments`
        )
      );
    }
  });
  return promises;
};

const parseData = async (users, postsArray, promises) => {
  let comments = await Promise.all(promises);
  let tempUserData,
    tempPostData = [];
  let finalData = [];
  for (let i = 0; i < limit; i++) {
    const { id, name, email, website, company, address } = users[i];
    tempUserData = {
      id,
      name,
      email,
      address: `${address.city}, ${address.street}, ${address.suite}`,
      website: `https://${website}`,
      company: company.name,
      posts: [],
    };
    postsArray.forEach((element) => {
      if (element.userId === id) {
        tempPostData.push({
          id: element.id,
          title: element.title,
          title_crop: `${element.title.slice(0, 20)}...`,
          body: element.body,
        });
      }
    });

    if (id === idOfNeededUser) {
      for (let i = 0; i < tempPostData.length; i++) {
        tempPostData[i].comments = comments[i].data;
      }
    }

    tempUserData.posts = tempPostData;
    finalData.push(tempUserData);
    tempPostData = [];
  }

  console.log(finalData);
  fs.writeFileSync("test.json", JSON.stringify(finalData));
};

Promise.all([getPosts(), getUsers()])
  .then(async (results) => {
    jsonUsers = results[1].data;
    jsonPosts = results[0].data;
    let promises = getComments(jsonPosts, idOfNeededUser);
    parseData(jsonUsers, jsonPosts, promises);
  })
  .catch((err) => {
    throw err;
  });
