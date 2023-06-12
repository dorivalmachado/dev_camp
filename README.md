# Dev Camp

`Dev Camp` is an API that allows users to manage users, bootcamps and courses data.
This project was developed using TypeScript, Node.JS, MongoDB and GraphQL.

## Build Setup

```
# install dependencies
npm install

# start the server (GraphiQL is started at http://127.0.0.1:3000/graphql)
npm run dev

# run tests
npm run test
```

## Some Query Examples

```js
mutation AddNewUser($name: String!, $email: String!, $role: String!, $password: String!) {
  addNewUser(name: $name, email: $email, role: $role, password: $password) {
    id
    name
    email
    role
    resetPasswordToken
    resetPasswordExpire
    confirmEmailToken
    isEmailConfirmed
    twoFactorCode
    twoFactorCodeExpire
    twoFactorEnable
  }
}
```

```js
query Query { # get logged user
  user {
    id
    name
    email
    role
    resetPasswordToken
    resetPasswordExpire
    confirmEmailToken
    isEmailConfirmed
    twoFactorCode
    twoFactorCodeExpire
    twoFactorEnable
  }
}
```

```js
# User must be logged and must be a publisher to create a bootcamp.
mutation AddNewBootcamp($name: String!, $description: String!, $website: String!, $phone: String!, $email: String!, $address: String!, $careers: [String]!, $housing: Boolean, $jobAssistance: Boolean, $jobGuarantee: Boolean, $acceptGi: Boolean) {
  addNewBootcamp(name: $name, description: $description, website: $website, phone: $phone, email: $email, address: $address, careers: $careers, housing: $housing, jobAssistance: $jobAssistance, jobGuarantee: $jobGuarantee, acceptGi: $acceptGi) {
    id
    name
    slug
    description
    website
    phone
    email
    address
    location {
      type
      coordinates
      formattedAddress
      street
      city
      state
      zipcode
      country
    }
    careers
    averageCost
    housing
    jobAssistance
    jobGuarantee
    acceptGi
    user {
      id
      name
    }
  }
}
```

```js
query Bootcamps($page: Int, $limit: Int) {
  bootcamps(page: $page, limit: $limit) {
    id
    name
    slug
    description
    website
    phone
    email
    address
    careers
    averageCost
    housing
    jobAssistance
    jobGuarantee
    acceptGi
  }
}
```

```js
mutation AddNewCourse($title: String!, $description: String!, $weeks: String!, $tuition: Float!, $minimumSkill: String!, $credits: Int!, $subject: String!, $bootcamp: String!, $scholarshipAvailable: Boolean) {
  addNewCourse(title: $title, description: $description, weeks: $weeks, tuition: $tuition, minimumSkill: $minimumSkill, credits: $credits, subject: $subject, bootcamp: $bootcamp, scholarshipAvailable: $scholarshipAvailable) {
    id
    title
    description
    weeks
    tuition
    minimumSkill
    scholarshipAvailable
    credits
    subject
    bootcamp {
      id
      name
      website
    }
    students {
      id
      name
      email
    }
    owner {
      id
      email
    }
  }
}
```

```js
# List all courses from a bootcamp
query CoursesByBootcamp($bootcampId: ID!) {
  coursesByBootcamp(id: $bootcampId) {
    id
    title
    description
    weeks
    tuition
    minimumSkill
    scholarshipAvailable
    credits
    subject
    bootcamp {
      id
      name
    }
    students {
      name
      email
    }
  }
}
```

```js
# The user must have role USER and be logged to enroll in a course
mutation Enroll($id: ID!) {
  enroll(courseId: $id) {
    id
    title
    description
    weeks
    tuition
    minimumSkill
    scholarshipAvailable
    credits
    subject
    bootcamp {
      name
    }
  }
}
```

```js
# The user must have role USER and be logged to disenroll from a course
mutation Disenroll($id: ID!) {
  disenroll(courseId: $id) {
    id
    title
    description
    weeks
    tuition
    minimumSkill
    scholarshipAvailable
    credits
    subject
    bootcamp {
      name
    }
  }
}
```
