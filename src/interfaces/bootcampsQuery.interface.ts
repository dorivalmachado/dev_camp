interface IQueryBootcamps {
    page: number | undefined
    limit: number | undefined
}

interface IMutationAddNewBootcamp {
    name: string
    description: string
    website: string
    phone: string
    email: string
    address: string
    careers: string[]
    housing?: boolean
    jobAssistance?: boolean
    jobGuarantee?: boolean
    acceptGi?: boolean
}

type IMutationUpdateBootcamp = Partial<IMutationAddNewBootcamp> & {id: string}

export { IQueryBootcamps, IMutationAddNewBootcamp, IMutationUpdateBootcamp };
