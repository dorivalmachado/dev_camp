import { BootcampDocument, bootcampsModel } from '../models/bootcamps.model';
import { coursesModel } from '../models/courses.model';

const getAverageCost = async (bootcampId: BootcampDocument) => {
  const obj = await coursesModel.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        weightedSum: { $sum: { $multiply: ['$tuition', '$credits'] } },
        creditsSum: { $sum: '$credits' },
      },
    },
    {
      $project: {
        averageCost: { $divide: ['$weightedSum', '$creditsSum'] },
      },
    },
  ]);
  try {
    await bootcampsModel.findByIdAndUpdate(bootcampId, {
      averageCost: Math.floor(obj[0].averageCost * 100) / 100,
    });
  } catch (err) {
    console.error(err);
  }
};

export default getAverageCost;
