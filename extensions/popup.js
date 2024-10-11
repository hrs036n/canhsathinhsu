let dataUser = [];
const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
const date = `${new Date().getFullYear()}_${month}_${new Date().getDate()}`;
let isCreate = false;

const fetchButton = document.getElementById("fetch-button");
const buttonDelete = document.getElementById("button-delete");
const buttonPost = document.getElementById("button-post");
const statusDiv = document.getElementById("status");
const statusBottomDiv = document.getElementById("statusBottom");
const test = document.getElementById("test");
const selectElement = document.getElementById("data-select");

function setProcessingState(isProcessing) {
  if (isProcessing) {
    fetchButton.disabled = true;
    fetchButton.innerHTML = 'Processing... <span class="processing"></span>';
  } else {
    fetchButton.disabled = false;
    fetchButton.innerHTML = "Checker";
  }
}

function setProcessingDelete(isProcessing) {
  if (isProcessing) {
    buttonDelete.disabled = true;
    buttonDelete.innerHTML = 'Processing... <span class="processing"></span>';
  } else {
    buttonDelete.disabled = false;
    buttonDelete.innerHTML = "Xóa data compare";
  }
}

function setProcessingPost(isProcessing) {
  if (isProcessing) {
    buttonPost.disabled = true;
    buttonPost.innerHTML = 'Processing... <span class="processing"></span>';
  } else {
    buttonPost.disabled = false;
    buttonPost.innerHTML = "Tạo data compare";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["token"], function (result) {
    if (result.token) {
      const token = JSON.parse(result.token);
      fetchValueSelect(token.user.email);
    } else {
      statusDiv.innerHTML = "Lỗi mẹ rồi =)))...";
    }
  });

  fetchButton.addEventListener("click", function () {
    setProcessingState(true);
    statusDiv.innerHTML = "Chờ tí đang chạy...";
    chrome.storage.local.get(["token"], function (result) {
      if (result.token) {
        const token = JSON.parse(result.token);
        fetchData(token);
        setTimeout(() => {
          setProcessingState(false);
        }, 2000);
      } else {
        statusDiv.innerHTML = "Lỗi mẹ rồi =)))...";
      }
    });
  });

  buttonDelete.addEventListener("click", function () {
    statusBottomDiv.innerHTML = "";
    setProcessingDelete(true);
    chrome.storage.local.get(["token"], function (result) {
      if (result.token) {
        const token = JSON.parse(result.token);
        deleted(token.user.email);
        setTimeout(() => {
          setProcessingDelete(false);
        }, 2000);
      } else {
        statusDiv.innerHTML = "Lỗi mẹ rồi =)))...";
      }
    });
  });

  buttonPost.addEventListener("click", function () {
    statusBottomDiv.innerHTML = "";
    setProcessingPost(true);
    chrome.storage.local.get(["token"], function (result) {
      if (result.token) {
        const token = JSON.parse(result.token);
        if (isCreate) {
          post(token);
        } else {
          statusBottomDiv.innerHTML = "Đã tạo rồi!!!";
        }
        setTimeout(() => {
          setProcessingPost(false);
          buttonPost.disabled = true;
        }, 2000);
      } else {
        statusDiv.innerHTML = "Lỗi mẹ rồi =)))...";
      }
    });
  });
});

function getValueUser(obj) {
  obj.data.forEach((user) => {
    dataUser.push({
      name: user.firstName + " " + user.lastName,
      dob: user.dob,
      job: user.job.name,
      projects: user.departments.map((x) => x.name).join(", "),
    });
  });
}

async function fetchValueSelect(user) {
  const selectElement = document.getElementById("data-select");
  const buttonPost = document.getElementById("button-post");

  try {
    const response = await fetch(
      `https://horus-t.vercel.app/api/get-select?user=${encodeURIComponent(
        user
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const value = await response.json();
    const options = [{ value: "default", label: "Default đầu tháng!!!" }];
    value.forEach((x) => {
      options.push({ value: x.date, label: x.date });
    });

    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      selectElement.appendChild(opt);
    });

    if (options.filter((x) => x.value === date).length > 0 || options.length >= 4) {
      isCreate = false;
      buttonPost.disabled = true;
    } else {
      isCreate = true;
    }
  } catch (error) {
    statusDiv.innerHTML = "Lỗi mẹ rồi =)))..." + error;
  }
}

async function fetchOldData(user) {
  const statusDiv = document.getElementById("status");
  const selectElement = document.getElementById("data-select");
  const test = document.getElementById("test");

  const date =
    selectElement.value === "default"
      ? `${new Date().getFullYear()}_${month}_1`
      : selectElement.value;

  const userRequest = selectElement.value === "default" ? `admin` : user;

  try {
    const response = await fetch(
      `https://horus-t.vercel.app/api/get?date=${encodeURIComponent(
        date
      )}&user=${encodeURIComponent(userRequest)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await response.json();
  } catch (error) {
    statusDiv.innerHTML = "Lỗi mẹ rồi =)))..." + error;
  }
}

async function post(token) {
  const statusDiv = document.getElementById("statusBottom");
  const selectElement = document.getElementById("data-select");

  try {
    const responseFetch = await fetch(
      "https://itcgroup.iworkspace.io/api/workspaces/employees/directory?search=&limit=1000",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
          "x-workspace": "49370ce0-014a-4d75-a3a9-ee4b4948b403",
        },
      }
    );
    const dataRes = await responseFetch.json();
    dataUser = [];
    getValueUser(JSON.parse(JSON.stringify(dataRes, null, 2)));

    const jsonData = {
      total: dataUser.length,
      data: dataUser,
    };

    const data = {
      data: jsonData,
      createdBy: token.user.email,
      date: date,
    };

    const response = await fetch(`https://horus-t.vercel.app/api/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const opt = document.createElement("option");
    opt.value = date;
    opt.textContent = date;
    selectElement.appendChild(opt);

    statusDiv.innerHTML = "Tạo thành công!!!";
    return await response.json();
  } catch (error) {
    statusDiv.innerHTML = "Lỗi mẹ rồi =)))..." + error;
  }
}

async function deleted(createdBy) {
  const selectElement = document.getElementById("data-select");
  const statusDiv = document.getElementById("statusBottom");
  const buttonPost = document.getElementById("button-post");

  const valueSelect = selectElement.value;

  if (valueSelect === "default") {
    statusDiv.innerHTML = "Default xóa dc méo ._.";
    return;
  }

  const data = {
    createdBy: createdBy,
    date: valueSelect,
  };

  try {
    const response = await fetch(`https://horus-t.vercel.app/api/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    for (let i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === valueSelect) {
        selectElement.remove(i);
        break;
      }
    }

    if (valueSelect === date) {
      isCreate = true;
      buttonPost.disabled = false;
    }

    if (valueSelect === "default") {
      buttonDelete.disabled = true;
    }

    statusDiv.innerHTML = "Xóa thành công!!!";

    return await response.json();
  } catch (error) {
    statusDiv.innerHTML = "Lỗi mẹ rồi =)))..." + error;
  }
}

async function fetchData(token) {
  const statusDiv = document.getElementById("status");
  const test = document.getElementById("test");

  try {
    const response = await fetch(
      "https://itcgroup.iworkspace.io/api/workspaces/employees/directory?search=&limit=1000",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
          "x-workspace": "49370ce0-014a-4d75-a3a9-ee4b4948b403",
        },
      }
    );
    const dataRes = await response.json();
    const oldData = await fetchOldData(token.user.email);

    statusDiv.innerHTML = "Đang lấy data chờ tí...";
    dataUser = [];

    getValueUser(JSON.parse(JSON.stringify(dataRes, null, 2)));

    const data = {
      total: dataUser.length,
      data: dataUser,
    };

    const getObjectDifferences = (obj1, obj2) => {
      const diff = {};

      for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
          diff[key] = { old: obj1[key], new: obj2[key] };
        }
      }

      for (const key in obj2) {
        if (!(key in obj1)) {
          diff[key] = { old: undefined, new: obj2[key] };
        }
      }

      return Object.keys(diff).length ? diff : null;
    };

    const getDifferences = (arr1, arr2) => {
      const diffArray = [];

      arr1.forEach((obj1) => {
        const match = arr2.find((obj2) => obj2.name === obj1.name);

        if (match) {
          const objDiff = getObjectDifferences(obj1, match);
          if (objDiff) {
            diffArray.push({ name: obj1.name, differences: objDiff });
          }
        } else {
          diffArray.push({
            "🚀🚀🚀🚀🚀🚀": "NHÂN VIÊN OUT",
            name: obj1.name,
            differences: obj1,
            isOut: true,
          });
        }
      });

      arr2.forEach((obj2) => {
        const match = arr1.find((obj1) => obj1.name === obj2.name);

        if (!match) {
          diffArray.push({
            "🚑🚑🚑🚑🚑🚑": "NHÂN VIÊN MỚI",
            name: obj2.name,
            differences: obj2,
            isNew: true,
          });
        }
      });

      return diffArray;
    };

    const differences = getDifferences(oldData[0].data.data, data.data);

    const compare = {
      total: {
        oldTotal: oldData[0].data.total,
        newTotal: data.total,
      },
      data: differences,
    };

    function getStringFromValue(value) {
      switch (value) {
        case "name":
          return "Họ tên";
        case "dob":
          return "Dob";
        case "job":
          return "Job";
        case "projects":
          return "Projects";
        default:
          return value;
      }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Culi Tracker Parttime</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1 {
                color: #333;
            }
            .total {
                margin-bottom: 20px;
            }
            .employee {
                width: calc(30% - 20px); /* Mỗi card chiếm 1/3 chiều rộng và trừ đi khoảng cách giữa các card */
                margin-bottom: 15px;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f9f9f9;
                text-align: center;
            }
            .differences {
                margin-top: 10px;
                padding: 5px;
                border-left: 3px solid #007bff;
                background-color: #e9ecef;
            }
            .employee-container {
              display: flex;
              flex-wrap: wrap; /* Cho phép các card tự động xuống dòng */
              gap: 10px; /* Khoảng cách giữa các card */
              justify-content: space-around; /* Căn đều các card trên hàng */
            }
        </style>
    </head>
    <body>
        ${
          compare.data.length === 0
            ? `<div style="font-size:20px;">
            <h1>Data Overview</h1>
            KHÔNG CÓ SỰ THAY ĐỔI
            <div class="total">
            <h2>Total: ${compare.total.oldTotal}</h2>
        </div>
        </div>`
            : `<h1>Data Overview</h1>
        <div class="total">
            <h2>Total</h2>
            <p><b><span style="color: red;">Old Total:</span></b> ${
              compare.total.oldTotal
            }</p>
            <p><b><span style="color: green;">New Total:</span></b> ${
              compare.total.newTotal
            }</p>
        </div>

        <h2>Details</h2>
        <div class="employee-container">
          ${compare.data
            .map(
              (employee) => `
              <div class="employee" style='${
                employee.isNew
                  ? "border: 3px solid #86f7ae;"
                  : employee.isOut
                  ? "border: 3px solid #f78686;"
                  : ""
              }'>
                  <h3>${
                    employee.isOut
                      ? `<span style="color: red;">🚀${employee.name}🚀 (OUT)</span>`
                      : employee.isNew
                      ? `<span style="color: green;">🚀${employee.name}🚀 (NEW)</span>`
                      : `🚀${employee.name}🚀`
                  }</h3>
                  <div class="differences">
                      ${Object.entries(employee.differences)
                        .map(([key, value]) => {
                          if (typeof value === "object") {
                            return `
                          <div>
                            <div style="margin: 10px;">
                              <b >${getStringFromValue(key)}</b>
                            </div>
                            <div style="margin-left: 20px; display: flex; gap: 5px; flex-direction: column;">
                              <div>
                                <span style="color: red;">Old:</span> ${
                                  value.old || "N/A"
                                },
                              </div>
                              <div>
                                <span style="color: green;">New:</span> ${
                                  value.new || "N/A"
                                }
                              </div>
                            </div>
                          </div>
                        `;
                          }

                          return `<p>${getStringFromValue(key)}: ${value}</p>`;
                        })
                        .join("")}
                  </div>
              </div>
          `
            )
            .join("")}
        </div>`
        }
    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    statusDiv.innerHTML = "Sắp xong rồi...";

    chrome.tabs.create({ url: url });
  } catch (error) {
    statusDiv.innerHTML = "Lỗi mẹ rồi =)))..." + error;
  }
}
