{"is_source_file": true, "format": "JavaScript", "description": "Authentication controller that handles user registration, login, email verification, password reset, and profile management.", "external_files": ["../models/userModel", "../services/emailService", "../config/auth"], "external_methods": ["UserModel.getUserByEmail", "UserModel.createUser", "UserModel.getUserByVerificationToken", "UserModel.updateUser", "UserModel.getUserById", "UserModel.getUserByResetToken"], "published": ["AuthController"], "classes": [{"name": "AuthController", "description": "Controller for handling authentication-related operations including user registration, login, and profile management."}], "methods": [{"name": "register(req, res)", "description": "Registers a new user after checking for email availability and sending a verification email.", "scope": "AuthController", "scopeKind": "class"}, {"name": "verifyEmail(req, res)", "description": "Verifies the user's email using the provided token.", "scope": "AuthController", "scopeKind": "class"}, {"name": "login(req, res)", "description": "Authenticates the user and returns a JWT token upon successful login.", "scope": "AuthController", "scopeKind": "class"}, {"name": "refreshToken(req, res)", "description": "Generates a new JWT token using a valid refresh token.", "scope": "AuthController", "scopeKind": "class"}, {"name": "requestPasswordReset(req, res)", "description": "Requests a password reset by sending a reset token to the user's email.", "scope": "AuthController", "scopeKind": "class"}, {"name": "resetPassword(req, res)", "description": "Resets the user's password using the provided token and new password.", "scope": "AuthController", "scopeKind": "class"}, {"name": "getProfile(req, res)", "description": "Returns the currently logged-in user's profile information.", "scope": "AuthController", "scopeKind": "class"}, {"name": "updateProfile(req, res)", "description": "Updates the user's profile information and sends a verification email if the email is changed.", "scope": "AuthController", "scopeKind": "class"}, {"name": "logout(req, res)", "description": "Handles user logout on the client side.", "scope": "AuthController", "scopeKind": "class"}, {"name": "verifyToken(req, res)", "description": "Verifies the provided JWT token and returns the associated user information.", "scope": "AuthController", "scopeKind": "class"}], "calls": ["bcrypt.hash", "jwt.sign", "jwt.verify", "UserModel.getUserByEmail", "UserModel.createUser", "UserModel.getUserByVerificationToken", "UserModel.updateUser", "UserModel.getUserById", "UserModel.getUserByResetToken", "emailService.sendVerificationEmail", "emailService.sendPasswordResetEmail"], "search-terms": ["AuthController", "user registration", "email verification", "password reset", "profile management"], "state": 2, "file_id": 15, "knowledge_revision": 155, "git_revision": "ca5dd1bf6845b8636ab91d03061ec68fd0bcd444", "revision_history": [{"31": "eaecfca3b59ef341b62d40a32566c1af4217bea6"}, {"155": "ca5dd1bf6845b8636ab91d03061ec68fd0bcd444"}], "ctags": [{"_type": "tag", "name": "AuthController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^class AuthController {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "UserModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const UserModel = require('..\\/models\\/userModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "authConfig", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const authConfig = require('..\\/config\\/auth');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "bcrypt", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const bcrypt = require('bcrypt');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "emailService", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const emailService = require('..\\/services\\/emailService');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "getProfile", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async getProfile(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "jwt", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const jwt = require('jsonwebtoken');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "login", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async login(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "logout", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async logout(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "passport", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^const passport = require('passport');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "refreshToken", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async refreshToken(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "register", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async register(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "requestPasswordReset", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async requestPasswordReset(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "resetPassword", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async resetPassword(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "updateProfile", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async updateProfile(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "username", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^        username,$/", "language": "JavaScript", "kind": "field", "scope": "AuthController.register.userData", "scopeKind": "class"}, {"_type": "tag", "name": "verifyEmail", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async verifyEmail(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}, {"_type": "tag", "name": "verifyToken", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "pattern": "/^  static async verifyToken(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "AuthController", "scopeKind": "class"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/src/controllers/authController.js", "hash": "70277d8c91332c2e025e60e4003a6e41", "format-version": 4, "code-base-name": "default", "fields": [{"name": "username,", "scope": "AuthController.register.userData", "scopeKind": "class", "description": "unavailable"}]}