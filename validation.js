function validateNewRole(roles, newRole) {
  for (let role of roles) {
    if (role.title === newRole) {
      return true;
    }
  }

  return false;
}

function validateNewDepartment(departments, newDepartment) {
  for (let department of departments) {
    if (department.name === newDepartment) {
      return true;
    }
  }

  return false;
}

module.exports.validateNewRole = validateNewRole;
module.exports.validateNewDepartment = validateNewDepartment;
