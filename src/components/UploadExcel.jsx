import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function UploadExcel({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar e processar dados
        const processedQuestions = jsonData.map((row, index) => {
          if (!row.categoria || !row.enunciado || !row.alternativa_a || !row.alternativa_b || 
              !row.alternativa_c || !row.alternativa_d || !row.resposta_correta) {
            throw new Error(`Linha ${index + 2}: Dados incompletos`);
          }

          const correctAnswerMap = {
            'A': 0, 'a': 0,
            'B': 1, 'b': 1,
            'C': 2, 'c': 2,
            'D': 3, 'd': 3
          };

          const correctAnswer = correctAnswerMap[row.resposta_correta];
          if (correctAnswer === undefined) {
            throw new Error(`Linha ${index + 2}: Resposta correta inválida (use A, B, C ou D)`);
          }

          return {
            category: row.categoria.toLowerCase(),
            question: row.enunciado,
            alternatives: [
              row.alternativa_a,
              row.alternativa_b,
              row.alternativa_c,
              row.alternativa_d
            ],
            correctAnswer,
            xpReward: row.xp || 50,
            explanation: row.explicacao || ''
          };
        });

        setPreview(processedQuestions);
      } catch (err) {
        setError(err.message);
        setPreview([]);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      setError('Nenhuma questão válida para enviar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const batch = writeBatch(db);
      
      preview.forEach((question) => {
        const docRef = doc(collection(db, 'questions'));
        batch.set(docRef, {
          ...question,
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();
      
      setSuccess(`${preview.length} questões enviadas com sucesso!`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('Erro ao enviar questões: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        categoria: 'ortografia',
        enunciado: 'Qual a forma correta?',
        alternativa_a: 'Opção A',
        alternativa_b: 'Opção B',
        alternativa_c: 'Opção C',
        alternativa_d: 'Opção D',
        resposta_correta: 'A',
        xp: 50,
        explicacao: 'Explicação aqui (opcional)'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questões');
    XLSX.writeFile(workbook, 'template_questoes.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upload de Questões via Excel</h2>
            <p className="text-gray-600 text-sm mt-1">Envie várias questões de uma vez</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">Primeira vez usando?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Baixe o template Excel para ver o formato correto das questões
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Template Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium mb-2">📋 Formato do Excel:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>categoria</strong>: ortografia, gramatica, interpretacao ou redacao</li>
              <li>• <strong>enunciado</strong>: Texto da pergunta</li>
              <li>• <strong>alternativa_a, alternativa_b, alternativa_c, alternativa_d</strong>: As 4 opções</li>
              <li>• <strong>resposta_correta</strong>: A, B, C ou D</li>
              <li>• <strong>xp</strong>: Pontos de recompensa (padrão: 50)</li>
              <li>• <strong>explicacao</strong>: Explicação da resposta (opcional)</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">Selecione o arquivo Excel</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-1">
                  {file ? file.name : 'Clique para selecionar arquivo Excel'}
                </p>
                <p className="text-sm text-gray-500">Formatos: .xlsx, .xls</p>
              </label>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erro</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Sucesso!</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">
                Preview: {preview.length} questões encontradas
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-3 border rounded-xl p-4">
                {preview.slice(0, 5).map((q, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary-600 uppercase">
                        {q.category}
                      </span>
                      <span className="text-xs text-gray-500">+{q.xpReward} XP</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Resposta correta: {String.fromCharCode(65 + q.correctAnswer)}
                    </p>
                  </div>
                ))}
                {preview.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    + {preview.length - 5} questões...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || preview.length === 0}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Enviando...' : `Enviar ${preview.length} Questões`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
