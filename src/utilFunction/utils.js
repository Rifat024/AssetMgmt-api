import { v4 as uuidv4 } from "uuid";
import { AppConfig } from "../commons/environment/appconfig";

export const findNode = (itemId, currentNode) => {
  var i, currentChild, result;
  if (itemId == currentNode._id) {
    return currentNode;
  } else {
    for (i = 0; i < currentNode?.children?.length; i += 1) {
      currentChild = currentNode.children[i];
      result = findNode(itemId, currentChild);

      if (result !== false) {
        return result;
      }
    }
    return false;
  }
};



export const deleteObjectByItemId = (itemId, recordObj) => {
  for (const key in recordObj.children) {
    if (typeof obj[key] === "object") {
      deleteObjectByItemId(obj[key], itemIdToDelete);
    } else if (key === "itemId" && obj[key] === itemId) {
      delete obj[key];
    }
  }
}

export const findParentNode = (itemId, currentNode) => {
  var i, currentChild, result;

  const indexMatched = currentNode.children.findIndex((child) => {
    return child.itemId === itemId;
  });

  if (indexMatched !== -1) {
    return currentNode;
  } else {
    for (i = 0; i < currentNode.children.length; i += 1) {
      currentChild = currentNode.children[i];
      result = findParentNode(itemId, currentChild);

      if (result !== false) {
        return result;
      }
    }
    return false;
  }
};

export const findChild = (itemId, currentNode) => {
  var i, currentChild, result;

  const indexMatched = currentNode.children.findIndex((child) => {
    return child.itemId === itemId;
  });

  if (indexMatched !== -1) {
    return currentNode.children[indexMatched];
  } else {
    for (i = 0; i < currentNode?.children?.length; i += 1) {
      currentChild = currentNode.children[i];
      result = findChild(itemId, currentChild);

      if (result !== currentChild) {
        return result;
      }
    }
    return "Folder not found";
  }
};

export const findItemCategoryNodes = (itemCatagory, items) => {
  const result = [];

  if (items.itemCatagory === itemCatagory) {
    items.itemId = uuidv4();
    result.push({ ...items, children: [] });
  }
  if (items?.children && items?.children?.length > 0) {
    for (const child of items?.children) {
      // Recursively call the function on child nodes
      child.parentId = items.itemId;
      result.push(...findItemCategoryNodes(itemCatagory, child));
    }
  }
  return result;
}

export const findItemCategoryNodesWithoutUpdateId = (itemCatagory, items) => {
  const result = [];

  if (items.itemCatagory === itemCatagory) {
    result.push({ ...items, children: [] });
  }
  if (items?.children && items?.children?.length > 0) {
    for (const child of items?.children) {
      // Recursively call the function on child nodes
      child.parentId = items.itemId;
      result.push(...findItemCategoryNodesWithoutUpdateId(itemCatagory, child));
    }
  }
  return result;
}
export const deleteRequestDataFromNodes = (items) => {
  if (items.itemCatagory === AppConfig.ITEM_CATEGORY.REQUEST || items.itemCatagory === AppConfig.ITEM_CATEGORY.EXAMPLE) {
    delete items?.requestData;
    delete items?.responseData;
  }
  if (items?.children && items?.children?.length > 0) {
    for (const child of items?.children) {
      deleteRequestDataFromNodes(child);
    }
  }
  return items;
}

export const excludeNode = (itemId, currentNode) => {
  var i, currentChild, result;

  const indexMatched = currentNode.children.findIndex((child) => {
    return child._id === itemId;
  });

  if (indexMatched !== -1) {
    currentNode.children.splice(indexMatched, 1);
    return true;
  } else {
    for (i = 0; i < currentNode.children.length; i += 1) {
      currentChild = currentNode.children[i];
      result = excludeNode(itemId, currentChild);

      if (result !== false) {
        return result;
      }
    }
    return false;
  }
};
