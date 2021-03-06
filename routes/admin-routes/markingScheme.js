const path = require('path');
const multer = require('multer');
const MarkingScheme = require('../../models/admin-models/markingScheme');
const Router = require('express').Router();


const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './MarkingSchemes');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10000000 // max file size 10MB = 1000000 bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls|ppt|pptx)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
});

Router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const { path, mimetype } = req.file;
      const file = new MarkingScheme({
        title,
        description,
        file_path: path,
        file_mimetype: mimetype
      });
      await file.save();
      res.send('file uploaded successfully.');
    } catch (error) {
      res.status(400).send('Error while uploading file. Try again later.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

Router.get('/getAllFiles', async (req, res) => {
  try {
    const files = await MarkingScheme.find({});
    const sortedByCreationDate = files.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(400).send('Error while getting list of files. Try again later.');
  }
});

Router.get('/getFile/:id', async (req, res) => {
  try {
    const file = await MarkingScheme.findById(req.params.id);
    res.send(file);
  } catch (error) {
    res.status(400).send('Error while getting the file. Try again later.');
  }
});

Router.route('/update/:id').post((req, res) => {
  MarkingScheme.findById(req.params.id)
    .then(file => {
      file.title = req.body.title;
      file.description = req.body.description;
      file.save()
        .then(() => res.json('MarkingScheme updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

Router.get('/download/:id', async (req, res) => {
  try {
    let downloadDirectory = __dirname;
    downloadDirectory = downloadDirectory.replace('routes\\admin-routes',' ');
    console.log(downloadDirectory);
    const file = await MarkingScheme.findById(req.params.id);
    res.set({
      'Content-Type': file.file_mimetype
    });
    res.sendFile(path.join(downloadDirectory, '..', file.file_path));
  } catch (error) {
    res.status(400).send('Error while downloading file. Try again later.');
  }
});

Router.delete('/file-delete/:id', async (req, res) => {
  try {
    MarkingScheme.findByIdAndDelete(req.params.id)
    .then(() => res.json('MarkingScheme deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
  } catch (error) {
    res.status(400).send('MarkingScheme Deletion Failed');
  }
});

module.exports = Router;
