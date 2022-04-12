const express = require('express');
var router = express.Router();
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const PAGE_SIZE = 10;
const bcrypt = require('bcrypt');


