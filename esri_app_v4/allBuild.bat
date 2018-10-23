echo Building eri_app_v4...
call npm run-script build
echo Done

cd ..
cd www.ideo-base.ieo.es
echo Building www.ideo-base.ieo.es...
call npm run-script build
echo Done

cd ..
cd www.ideo-cabrera.ieo.es
echo Building www.ideo-cabrera.ieo.es...
call npm run-script build
echo Done

cd ..
cd www.ideo-elhierro.ieo.es
echo Building www.ideo-elhierro.ieo.es...
call npm run-script build
echo Done

cd ..
cd www.ideo-namibia.ieo.es
echo Building www.ideo-namibia.ieo.es...
call npm run-script build
echo Done

cd ..
cd www.ideo-tpea.es
echo Building www.ideo-tpea.es...
call npm run-script build
echo Done
