export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const BINARY_SEARCH_TREE_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `function treeSearch(node, key) : node or empty slot
    while node is not empty
        if key = node.key
            return node
        if key < node.key
            node <- node.left
        else
            node <- node.right
    return empty slot

function treeInsert(root, key) : new root
    parent <- empty slot
    node <- root
    while node is not empty
        parent <- node
        if key = parent.key
            return root        -- duplicate: nothing changes
        if key < parent.key
            node <- parent.left
        else
            node <- parent.right
    newNode.key <- key
    if parent is empty
        return newNode         -- the tree was empty
    if key < parent.key
        parent.left <- newNode
    else
        parent.right <- newNode
    return root`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def tree_search(root, key):
    node = root
    while node is not None:
        if key == node.value:
            return node
        node = node.left if key < node.value else node.right
    return None


def tree_insert(root, key):
    parent = None
    node = root
    while node is not None:
        parent = node
        if key == node.value:
            return root
        node = node.left if key < node.value else node.right
    new_node = Node(key)
    if parent is None:
        return new_node
    if key < parent.value:
        parent.left = new_node
    else:
        parent.right = new_node
    return root`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function treeSearch(root, key) {
  let node = root
  while (node !== null) {
    if (key === node.value) {
      return node
    }
    node = key < node.value ? node.left : node.right
  }
  return null
}

function treeInsert(root, key) {
  let parent = null
  let node = root
  while (node !== null) {
    parent = node
    if (key === node.value) {
      return root
    }
    node = key < node.value ? node.left : node.right
  }
  const newNode = { value: key, left: null, right: null }
  if (parent === null) {
    return newNode
  }
  if (key < parent.value) {
    parent.left = newNode
  } else {
    parent.right = newNode
  }
  return root
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `Node* treeSearch(Node* root, int key) {
  Node* node = root;
  while (node != nullptr) {
    if (key == node->value) {
      return node;
    }
    node = key < node->value ? node->left : node->right;
  }
  return nullptr;
}

Node* treeInsert(Node* root, int key) {
  Node* parent = nullptr;
  Node* node = root;
  while (node != nullptr) {
    parent = node;
    if (key == node->value) {
      return root;
    }
    node = key < node->value ? node->left : node->right;
  }
  Node* newNode = new Node{key, nullptr, nullptr};
  if (parent == nullptr) {
    return newNode;
  }
  if (key < parent->value) {
    parent->left = newNode;
  } else {
    parent->right = newNode;
  }
  return root;
}`,
  },
]
