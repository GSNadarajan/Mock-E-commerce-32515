{"is_source_file": true, "format": "JavaScript", "description": "End-to-end integration test for the complete user-order flow in an e-commerce application using Jest and Axios.", "external_files": ["../../../utils/test-helpers"], "external_methods": ["testHelpers.createUser", "testHelpers.loginUser", "testHelpers.addItemToCart", "testHelpers.getCart", "testHelpers.createOrder", "testHelpers.getOrder", "testHelpers.deleteOrder", "testHelpers.deleteUser"], "published": [], "classes": [], "methods": [], "calls": ["axios.post", "axios.get", "axios.delete"], "search-terms": ["user-order flow", "integration test", "e-commerce", "Jest", "Axios"], "state": 2, "file_id": 62, "knowledge_revision": 165, "git_revision": "", "ctags": [{"_type": "tag", "name": "ORDER_SERVICE_URL", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/integration/test_user_order_flow_integration.js", "pattern": "/^const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http:\\/\\/localhost:3001\\/api';$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "USER_SERVICE_URL", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/integration/test_user_order_flow_integration.js", "pattern": "/^const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http:\\/\\/localhost:3000\\/api';$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "axios", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/integration/test_user_order_flow_integration.js", "pattern": "/^const axios = require('axios');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "testHelpers", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/integration/test_user_order_flow_integration.js", "pattern": "/^const testHelpers = require('..\\/..\\/..\\/utils\\/test-helpers');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/integration/test_user_order_flow_integration.js", "hash": "dc8c8b1e9cd51e28b257a4fa4175f288", "format-version": 4, "code-base-name": "default", "revision_history": [{"165": ""}]}