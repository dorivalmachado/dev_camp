interface IMutationAddNewCourse {
  title: string
  description: string
  weeks: string
  tuition: number
  minimumSkill: string
  scholarshipAvailable: boolean
  credits: number
  subject: string
  bootcamp: string
}

interface IQueryCourses {
  page: number | undefined
  limit: number | undefined
}

type IMutationUpdateCourse = Partial<IMutationAddNewCourse> & {id: string}

export { IMutationAddNewCourse, IQueryCourses, IMutationUpdateCourse };
