/**
 * 一次性脚本：手动催熟"月季光"——回退 plantedAt 到 14 天前
 * 用途：跨过 germination→growing→budding→blooming 累计阈值
 * 不手改 stage，让生长引擎在下次 care 时自己算
 * 跑法：cd server && node scripts/age-flower.js
 */
const { MongoClient } = require('mongodb');

const URI = 'mongodb://2443570228_db_user:Wz68q0Ert4KiYL80@ac-t0hhkmh-shard-00-00.morxwff.mongodb.net:27017,ac-t0hhkmh-shard-00-01.morxwff.mongodb.net:27017,ac-t0hhkmh-shard-00-02.morxwff.mongodb.net:27017/cyber-bloom?ssl=true&replicaSet=atlas-vl5bv0-shard-0&authSource=admin&appName=Cluster0';

(async () => {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db();
  const col = db.collection('flowers');

  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

  const before = await col.findOne({ name: '月季光' });
  if (!before) {
    console.error('❌ 未找到 name=月季光 的花');
    await client.close();
    process.exit(1);
  }

  console.log('=== 修改前 ===');
  console.log(`  plantedAt       : ${before.plantedAt}`);
  console.log(`  stage           : ${before.stage}`);
  console.log(`  health          : ${before.health}`);
  console.log(`  stageTimestamps :`, JSON.stringify(before.stageTimestamps));

  const result = await col.findOneAndUpdate(
    { name: '月季光' },
    {
      $set: {
        plantedAt: fourteenDaysAgo,
        stageTimestamps: { seed: fourteenDaysAgo },
      },
    },
    { returnDocument: 'after' },
  );

  const after = result.value || result;  // driver v4: .value; v5+: 直接返回
  console.log('\n=== 修改后 ===');
  console.log(`  plantedAt       : ${after.plantedAt}`);
  console.log(`  stage           : ${after.stage}  ← 未手改，下次 care 由 growthEngine 算`);
  console.log(`  health          : ${after.health}`);
  console.log(`  stageTimestamps :`, JSON.stringify(after.stageTimestamps));
  console.log(`\n✅ 14天前 = ${fourteenDaysAgo.toISOString()}`);
  console.log('现在去小程序对月季光浇一次水，观察 stage 是否推进。');

  await client.close();
})();
