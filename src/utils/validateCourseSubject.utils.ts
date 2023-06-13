import { BootcampDocument, CareersTypes, bootcampsModel } from '../models/bootcamps.model';

const validateCourseSubject = async (
  bootcampId: BootcampDocument,
  subject: CareersTypes,
) => {
  const bootcamp = await bootcampsModel.findById(bootcampId);
  return bootcamp?.careers.includes(subject);
};

export default validateCourseSubject;
