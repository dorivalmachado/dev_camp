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
}

export {IQueryBootcamps, IMutationAddNewBootcamp}